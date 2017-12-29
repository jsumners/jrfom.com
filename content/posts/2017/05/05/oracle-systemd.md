---
title: Starting Oracle 12c With Systemd
date: 2017-05-05T15:15:00-04:00
slug: starting-oracle-12c-with-systemd
---

I have put off migrating to RHEL 7 at work for just about as long as I quite
possibly can. The reason? The shit show known as [systemd][shitshow]. But the
time draws near that RHEL 6 will be EOLed, so I have begun migrating in earnest.
Part of that migration is a rather important Oracle database server. Since
I like being able to start and stop things via the system service manager,
I needed make it so Oracle can be started and stopped via systemd. Some basic
searching will yield some very basic service files; basic enough that I'm
surprised anyone would rely upon them. So, since neither Oracle nor Red Hat
have deigned to solve this problem, I have done it. This post is a description
of how I did so.

First, the Oracle database does not provide a foreground running mode. So
that immediately complicates matters. Second, there are actually two parts to
the database service: a "listener" for client connections and the actual
database server. So at a minimum we need two systemd services. However, a single
database server can host multiple databases, or "SID"s in Oracle parlance. Thus,
we need `n` services for `n` SIDs.

## Listener

Let's tackle the listener first. For this service we will need three components:
a start script, a stop script, and the service file.

Note: all scripts in this article are [Ansible][ansible] templated. Which means
when you see something like `{{oracle_home}}` you should substitute a value
that corresponds to your environment. To be clear: ***you cannot simply copy
and paste these scripts***. You must review them and adjust them for your
own environment.

### `/usr/local/bin/lsnrstart`

```sh
#!/bin/bash
# {{ansible_managed}}

runner=$(whoami)
if [ "${runner}" != "oracle" ]; then
  echo "must run as the oracle user"
  exit 1
fi

cd ${ORACLE_HOME}

if [ -f lsnr.pid ]; then
  curPid=$(cat lsnr.pid)
  pidIsPresent=$(ps -p ${curPid})
  if [ ${pidIsPresent} -eq 0 ]; then
    lsnrPid=$(ps uax | grep tnslsnr | grep -v -m 1 grep | awk '{print $2}')
    if [ "${curPid}" == "${lsnrPid}" ]; then
      echo "already running"
      exit 0
    fi
  fi
  # must be from an old process
  rm -f lsnr.pid
fi

./bin/lsnrctl start
exitCode=$?

if [ ${exitCode} -eq 0 ]; then
  lsnrPid=$(ps uax | grep tnslsnr | grep -v -m 1 grep | awk '{print $2}')
  echo ${lsnrPid} > lsnr.pid
  exit 0
else
  exit ${exitCode}
fi
```

### `/usr/bin/local/lsnrstop`

```sh
#!/bin/bash
# {{ansible_managed}}

runner=$(whoami)
if [ "${runner}" != "oracle" ]; then
  echo "must run as the oracle user"
  exit 1
fi

cd ${ORACLE_HOME}
if [ -f lsnr.pid ]; then
  curPid=$(cat lsnr.pid)
  ps -p ${curPid} > /dev/null
  if [ $? -eq 0 ]; then
    lsnrPid=$(ps uax | grep tnslsnr | grep -v -m 1 grep | awk '{print $2}')
    if [ "${curPid}" == "${lsnrPid}" ]; then
      ./bin/lsnrctl stop
    fi
  fi
  rm -rf lsnr.pid
fi
```

### `/etc/systemd/system/oracle-listener.service`

```ini
# {{ansible_managed}}
[Unit]
Description=Oracle Database Listener
After=syslog.target network.target

[Service]
LimitMEMLOCK=infinity
LimitNOFILE={{snofile}}:{{hnofile}}
LimitNPROC={{snproc}}:{{hnproc}}
LimitSTACK={{sstack}}K:{{hstack}}K

Type=forking
PIDFile={{oracle_home}}/lsnr.pid
User=oracle
Group=oinstall
Environment="ORACLE_HOME={{oracle_home}}"
Environment="ORACLE_BASE=/opt/oracle"
Environment="LD_LIBRARY_PATH={{oracle_home}}/ctx/lib:{{oracle_home}}/lib"
ExecStart=/usr/local/bin/lsnrstart
ExecStop=/usr/local/bin/lsnrstop
TimeoutStartSec=30
TimeoutStopSec=60
Restart=always
RestartSec=10
```

## Database Service

The database service is significantly more complicated. We need components:
parent service, template service, start script and stop script. The complicated
bits are 1) the relationship between the "parent service" and the
"template service" and 2) actually starting and stopping database SIDs.

Buried in the [description of unit files][unitdesc] is this tidbit:

> Optionally, units may be instantiated from a template file at runtime. This
> allows creation of multiple units from a single configuration file. If systemd
> looks for a unit configuration file, it will first search for the literal unit
> name in the file system. If that yields no success and the unit name contains
> an "@" character, systemd will look for a unit template that shares the same
> name but with the instance string (i.e. the part between the "@" character and
> the suffix) removed. Example: if a service getty@tty3.service is requested and
> no file by that name is found, systemd will look for getty@.service and
> instantiate a service from that configuration file if it is found.

> To refer to the instance string from within the configuration file you may use
> the special "%i" specifier in many of the configuration options. ...

We can take advantage of this by defining an empty "parent" service that will
start and stop all of the real SID services. Thus, we will have the following
structure:

1. `/etc/systemd/system/oracle.service`
1. `/etc/systemd/system/oracle@.service`
1. `/etc/systemd/system/oracle.service.wants`
1. `/etc/systemd/system/oracle.service.wants/oracle@some_sid.service` -- this
is a symlink back to `/etc/systemd/system/oracle@.service`. It should be repeated
for each SID your server serves.

The next difficult bit is that Oracle 12c is started via `sqlplus` and not
some dedicated binary. So I had to deconstruct the `dbstart` and `dbshut`
scripts Oracle ships to figure out exactly how to start individual instances;
the shipped scripts start or stop all defined SIDs at once.

### `/usr/local/bin/dbstart`

```sh
#!/bin/bash
# {{ansible_managed}}

runner=$(whoami)
if [ "${runner}" != "oracle" ]; then
  echo "must run as the oracle user"
  exit 1
fi

cd ${ORACLE_HOME}

INST=${1}
PMON="ora_pmon_${INST}"
SQLDBA="${ORACLE_HOME}/bin/sqlplus /nolog"

if [ -z ${INST} ]; then
  echo "must supply instance (SID) as first parameter"
  exit 1
fi

ORATAB=/etc/oratab
if [ ! -e ${ORATAB} ]; then
  echo "${ORATAB} not found"
  exit 1
fi

# Process oratab to see if the supplied instance should even be started
# and setup some environment if so
while read LINE
do
  case ${LINE} in
    \#*) ;;
    *)
      ORACLE_SID=$(echo ${LINE} | awk -F: '{print $1}')
      if [ "${ORACLE_SID}" != "${INST}" ]; then continue; fi
      IS_Y=$(echo ${LINE} | awk -F: '{print $NF}')
      if [ "${IS_Y}" != "Y" ]; then
        echo "oratab indicates to skip, not starting"
        # create the pid file to keep systemd happy
        touch db_${ORACLE_SID}.pid
        # exit 255 so that we can use `Restart=on-failure`
        exit 255
      fi
      ORACLE_HOME=$(echo ${LINE} | awk -F: '{print $2}')
      PATH=${ORACLE_HOME}/bin:/bin:/usr/bin:/etc:${PATH}
      LD_LIBRARY_PATH=${ORACLE_HOME}/lib:${LD_LIBRARY_PATH}
      export ORACLE_HOME
      export ORACLE_SID
      export PATH
      export LD_LIBRARY_PATH
      PFILE="${ORACLE_HOME}/dbs/init${ORACLE_SID}.ora"
      SPFILE="${ORACLE_HOME}/dbs/spfile${ORACLE_SID}.ora"
      SPFILE1="${ORACLE_HOME}/dbs/spfile.ora"
      break
      ;;
  esac
done < ${ORATAB}

if [ -f ${ORACLE_HOME}/dbs/sgadef${ORACLE_SID}.dbf -o -f ${ORACLE_HOME}/dbs/sgadef${ORACLE_SID}.ora ]; then
  echo -e "connect / as sysdba\nshutdown abort\nquit" | ${SQLDBA}
  if [ $? -ne 0 ]; then
    echo "failed to stop previous instance, aborting"
    exit 1
  fi
fi

PIDFILE=db_${ORACLE_SID}.pid
if [ -f ${PIDFILE} ]; then
  curPid=$(cat ${PIDFILE})
  if [ ! -z ${curPid} ]; then
    pidIsPresent=$(ps -p ${curPid})
    if [ ${pidIsPresent} -eq 0 ]; then
      dbPid=$(ps uax | grep ${PMON} | grep -v -m 1 grep | awk '{print $2}')
      if [ "${curPid}" == "${dbPid}" ]; then
        echo "already running"
        exit 0
      fi
    fi
  fi
  # must be from an old process
  rm -f ${PIDFILE}
fi

if [ -e "${PFILE}" -o -e "${SPFILE}" -o -e "${SPFILE1}" ]; then
  echo -e "connect / as sysdba\nstartup\nquit" | ${SQLDBA}
  exitCode=$?

  if [ ${exitCode} -eq 0 ]; then
    dbPid=$(ps uax | grep ${PMON} | grep -v -m 1 grep | awk '{print $2}')
    if [ -z ${dbPid} ]; then
      echo "failed to start ${ORACLE_SID}, could not find ${PMON} pid"
      exit 1
    fi
    echo ${dbPid} > ${PIDFILE}
    exit 0
  else
    echo "failed to start ${ORACLE_SID}"
    exit ${exitCode}
  fi
else
  echo "no init file found for ${ORACLE_SID}, not starting"
  exit 1
fi
```

### `/usr/local/bin/dbstop`

```sh
#!/bin/bash
# {{ansible_managed}}

runner=$(whoami)
if [ "${runner}" != "oracle" ]; then
  echo "must run as the oracle user"
  exit 1
fi

cd ${ORACLE_HOME}

INST=${1}
PMON="ora_pmon_${INST}"
SQLDBA="${ORACLE_HOME}/bin/sqlplus /nolog"

if [ -z ${INST} ]; then
  echo "must supply instance (SID) as first parameter"
  exit 1
fi

ORATAB=/etc/oratab
if [ ! -e ${ORATAB} ]; then
  echo "${ORATAB} not found"
  exit 1
fi

# Process oratab to see if the supplied instance should even be stopped
# and setup some environment if so
while read LINE
do
  case ${LINE} in
    \#*) ;;
    *)
      ORACLE_SID=$(echo ${LINE} | awk -F: '{print $1}')
      if [ "${ORACLE_SID}" != "${INST}" ]; then continue; fi
      IS_Y=$(echo ${LINE} | awk -F: '{print $NF}')
      if [ "${IS_Y}" != "Y" ]; then
        echo "oratab indicates to skip, not stopping"
        exit 1
      fi
      ORACLE_HOME=$(echo ${LINE} | awk -F: '{print $2}')
      PATH=${ORACLE_HOME}/bin:/bin:/usr/bin:/etc:${PATH}
      LD_LIBRARY_PATH=${ORACLE_HOME}/lib:${LD_LIBRARY_PATH}
      export ORACLE_HOME
      export ORACLE_SID
      export PATH
      export LD_LIBRARY_PATH
      break
      ;;
  esac
done < ${ORATAB}

PIDFILE=db_${ORACLE_SID}.pid
if [ -f ${PIDFILE} ]; then
  curPid=$(cat ${PIDFILE})
  ps -p ${curPid} > /dev/null
  if [ $? -eq 0 ]; then
    dbPid=$(ps uax | grep ${PMON} | grep -v -m 1 grep | awk '{print $2}')
    if [ "${curPid}" == "${dbPid}" ]; then
      echo -e "connect / as sysdba\nshutdown immediate\nquit" | ${SQLDBA}
      if [ $? -ne 0 ]; then
        echo "shutdown failed, exiting"
        exit 1
      fi
    fi
  fi
  rm -f ${PIDFILE}
fi
```

### `/etc/systemd/system/oracle.service`

```ini
# {{ansible_managed}}
[Unit]
Description=Oracle Database 12c
After=oracle-listener.service

# This non-service merely exists so that database instances managed
# via oracle@.service can all be started/stopped at the same time.
[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/bin/bash -c 'echo "starting oracle database service"'
```

### `/etc/systemd/system/oracle@.service`

```ini
# {{ansible_managed}}
[Unit]
Description=Oracle Database instance %I
BindTo=oracle.service
After=oracle.service

[Install]
WantedBy=oracle.service

[Service]
LimitMEMLOCK=infinity
LimitNOFILE={{snofile}}:{{hnofile}}
LimitNPROC={{snproc}}:{{hnproc}}
LimitSTACK={{sstack}}K:{{hstack}}K

Type=forking
PIDFile={{oracle_home}}/db_%I.pid
User=oracle
Group=oinstall
Environment="ORACLE_HOME={{oracle_home}}"
Environment="ORACLE_BASE=/opt/oracle"
ExecStart=/usr/local/bin/dbstart %I
ExecStop=/usr/local/bin/dbstop %I
TimeoutStartSec=30
TimeoutStopSec=60
# Despite the following, disabled SIDs will continually try to restart.
# I suspect it's because shitstemd is confused by being told a PID file will
# exist, but no usable such file can be generated since no process will be
# started. Of course, the documentation makes it sound like this will work.
Restart=on-failure
RestartSec=10
RestartPreventExitStatus=255
SucessExitStatus=0 255
```

[shitshow]: http://without-systemd.org/wiki/index.php/Arguments_against_systemd
[ansible]: http://docs.ansible.com/
[unitdesc]: https://www.freedesktop.org/software/systemd/man/systemd.unit.html
