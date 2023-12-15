---
title: Managing Node.js Processes
date: 2023-12-15T11:45:00-04:00
lastmod: 2023-12-15T11:45:00-04:00
slug: node-process-management
---

Recently, I posted to Twitter: "why do people still use pm2?" The post garnered
much more attention than I expected it to, and I was asked by several people:
"what is your alternative?" This article will outline why I think using `pm2`
is unnecessary and what I think should be done instead.

## What Is PM2?

`pm2`, per [their readme][pm2-readme], is:

> ... a production process manager for Node.js applications with a built-in
> load balancer. It allows you to keep applications alive forever, to reload
> them without downtime and to facilitate common system admin tasks.

In short: it's a tool that launches your Node.js based application, watches
it to detect when it has failed, and restarts it upon failure.

It also provides some measure of application performance monitoring (APM). I
will not be focusing on the APM aspect in this article. Instead, I will focus
on the primary use case as described in the quote and what I have seen when
dealing with issues around `pm2` in my open source work. What I'll say about
the APM piece is that there are plenty of tools, e.g.
[OpenTelemetry][otel], that can provide equivalent or better insights.

## PID 1

[Process management][proc-manage] is how modern operating systems (OSes) provide
multitasking. Without process management, we'd boot our computers into a single
application, do work, close the application, and the computer would shutdown
(as an over simplification). On a Linux based system, this translates into:

1. The kernel is started via the bootloader.
2. The kernel initializes itself and then spawns a defined application.
3. The application spawned by the kernel is a process manager and is
assigned to [PID 1][pid] (process identifier 1).
4. All other applications, from a CLI shell to a web browser, are spawned from
and managed by the PID 1 process.

There are many different process managers. A short list of process managers
used by various Linux (and BSD) systems to provide PID 1 is:

+ [System V](https://en.wikipedia.org/wiki/UNIX_System_V)
+ [OpenRC](https://en.wikipedia.org/wiki/OpenRC)
+ [S6](https://wiki.gentoo.org/wiki/S6_and_s6-rc-based_init_system)
+ [runit](https://en.wikipedia.org/wiki/Runit) (my personal preference)
+ [systemd](https://en.wikipedia.org/wiki/Systemd)

## Why PM2?

Great, so we know what a process manager is, that `pm2` is one, and that
OSes ship with one probably found in that short list. So why does `pm2` exist
if we already have a process manager at our disposal? Personally, I think it
is due to a few primary reasons:

1. The majority of people developing Node.js applications for server systems
are not experts on application deployment.
2. Software developers like to use tools written in the same language they are
writing their own sofware in.
3. That part about "a built-in load balancer" in the `pm2` description quoted
above.
4. Someone wrote an article that suggested using it, the article became popular,
and eventually turned in to gospel passed down through the ages.

Consider the following basic web server application:

```js
'use strict'

const server = require('fastify')({ logger: true })

server.route({
  path: '/',
  method: 'get',
  handler (req, res) {
    res.send('hello world')
  }
})

server.listen({ port: process.env.PORT })
```

`pm2` makes it easy to start, and keep running, such an application:

```sh
$ export PORT=8080
$ pm2 start index.js
```

It also provides a simple switch to enable load balancing, what it calls
"cluster mode," that will utilize multiple CPUs (or CPU cores) for the server:

```sh
$ export PORT=8080
$ pm2 start index.js -i 2 # where 2 is the number of CPUs to use
```

From there, it provides tooling for inspecting and managing logs and viewing
metrics around the process. You can consult their documentation for more
information on these features.

## Why Not PM2?

The short answer is: you already have the tools to accomplish the primary
function of `pm2`. We'll see that later when I present my suggested
alternative. For now, let's inspect how `pm2` does some of the things it does.

First, it wraps the application in what it calls a
[`ProcessContainer`][proc-container]. This container starts the application
in a subprocess with an IPC channel, [monkey patches][🐒🩹] `process.stdout`
and `process.stdin`, registers handler for typical process signals, and
registers handlers for `uncaughtException` and `unhandledRejection`. I recommend
reading through the linked container source code to understand how `pm2` is
handling your process. Pay close attention to the `stdout` and `stdin` patches.
We see regularly see [issues in Pino][pino-issues] regarding monkey patched
`stdout`, with several of them being due to the patching done by `pm2`.

Second, `pm2` enables "load balancing" through the use of Node.js's
[cluster module][cluster]. This module implements a round-robin load balancing
algorithm, which `pm2` seems to rely upon, as its primary balancing algorithm.
The result is all network connections really going to a single process, the
`pm2` process, and then getting balanced to one of the forked processes. While
the overhead introduced here may be negligible if `pm2` is only being used to
manage a singular application, I highly doubt it remains so when multiple
applications are being managed by `pm2`.

Ultimately, using `pm2` to manage your process means you have wrapped your
Node.js application up in another Node.js application thereby inheriting any
performance penalties of that parent application in addition to your own
application's performance characteristics.

## What Instead?

Assuming the application is being deployed to a full system, e.g. "bare metal"
or some sort of virtual machine or VPS, we should utilize the OS's native
process manager. A typical deployment host in this sort of setup is
[Debian][debian], which, at this time, uses `systemd` as its process manager.

Recall that I mentioned `pm2` adds handlers for process signals and process
errors. In order for our application to work correctly with a typical process
manager we need to update it in the same manner that `pm2` is doing 
automatically:

```js
'use strict'

const server = require('fastify')({ logger: true })

function handleSignal(sig) {
  server.log.info(`handling signal ${sig}`)
  server.close()
}
['SIGINT', 'SIGTERM'].forEach(sig => process.on(sig, handleSignal))

process.on('uncaughtException', error => {
  server.log.warn('got uncaughtException', error)
  server.close()
})
process.on('unhandledRejection', error => {
  server.log.warn('got unhandledRejection', error)
  server.close()
})

server.route({
  path: '/',
  method: 'get',
  handler (req, res) {
    res.send('hello world')
  }
})

server.listen({ port: process.env.PORT })
````

Subsequently, we can configure the process manager to manage the application:

1. Add a new unprivilged user for our application:
    ```sh
    adduser --system myapp
    ```
2. Create a deployment location for the app:
    ```sh
    mkdir -p /opt/apps/myapp && chown myapp /opt/apps/myapp
    ```
3. Deploy the app:
    ```sh
    cd /opt/apps/myapp && tar xcf /tmp/myapp.tar.gz
    ```
4. Add a service description file as `/etc/systemd/system/myapp.service`:
    ```toml
    [Unit]
    Description=My Cool Web Server
    Requires=network.target

    [Service]
    Type=simple
    Restart=always
    RestartSec=1
    User=myapp
    Group=nogroup
    WorkingDirectory=/opt/apps/myapp
    Environment="PORT=8000"
    ExecStart=/usr/bin/node /opt/apps/myapp/index.js

    [Install]
    WantedBy=multi-user.target
    ```
5. Activate the service:
    ```sh
    systemctl daemon-reload
    systemctl enable myapp
    systemctl start myapp.service
    ```
6. Verify the service is working:
    ```sh
    curl http://127.0.0.1:8000/
    ```

Is this more involved? Yes, clearly. Normally this sort of thing will be 
automated through some sort of infrastructure as code tool like
[Ansible][ansible]. However, we gain a few benefits from utilizing the sytem
tools:

1. Anyone familiar with the standard OS tools will be familiar with how to
manage the service.
2. We gain limited process privileges through the use of system accounts.
3. Our service will start with the system according to the service configuration.
4. Logs are managed through the standard system log management, e.g.:
    ```sh
    journalctl -u myapp
    ```

### Clustering

There is one caveat to the above example: it's a singular process utilizing
one CPU core according to the standard Node.js core usage. If we we want to
dedicate more resources to our application, we need to do a little more work.

First, we need to boot multiple instance of our application. With `systemd`,
we can rewrite our service using a target instead:

1. Create `/etc/systemd/system/myapp.target` like:
    ```toml
    [Unit]
    Description=My Cool Web Server
    Requires=myapp@1.service myapp@2.service

    [Install]
    WantedBy=multi-user.target
    ```
2. Create `/etc/systemd/system/myapp@.service` like:
    ```toml
    [Unit]
    Description=My Cool Web Server %I
    Requires=network.target
    PartOf=myapp.target

    [Install]
    WantedBy=myapp.service

    [Service]
    Type=simple
    Restart=always
    RestartSec=1
    User=myapp
    Group=nogroup
    WorkingDirectory=/opt/apps/myapp
    Environment="PORT=800%I"
    ExecStart=/usr/bin/node /opt/apps/myapp/index.js
    ````
3. Install the service:
    ```sh
    systemctl daemon-reload
    systemclt enable myapp.target
    ``` 
4. Start the service as many times as CPU resources desired:
    ```sh
    systemctl start myapp.target
    ```
5. Verify they are running:
    ```sh
    curl http://127.0.0.1:8001
    curl http://127.0.0.1:8002
    ```
    *Note that both instances will be restarted on system boot.*

Second, we need a way to load balance traffic to those instances. To do so,
we should [use a reverse proxy][fastify-rec]. My preference is to use
[HAProxy][haproxy]. In short, install HAProxy, provide a configuration like
the following one, and enable the service:

```toml
frontend myapp-proxy
  bind 0.0.0.0:80
  use_backend myapp-backend

backend myapp-backend
  server myapp1 127.0.0.1:8001
  server myapp2 127.0.0.2:8002
```

We get the same sort of round-robin load balancing as the `pm2` load balancing,
but in a separate process. This allows us to restart individual instances
at will without downtime (e.g. `systemctl restart myapp@1`), among other
niceties like TLS termination (see the linked "use a reverse proxy" article
for a full example that includes TLS termination).

### Containerized Deployment

But deploying in the bare metal manner described above is an increasingly
rare method of deploying applications. Nowadays most deployments are done
through some form of [containerization][container]. The most basic of which
is [Docker][docker]. In such a case, the container host acts as the process
manager and the "container" is the process. This means that the container
should be written such that the embedded application is booted directly:

```dockerfile
FROM debian:stable-slim

# copy script and node_modules into the container

PORT 8000
CMD ["node", "/myapp/index.js"]
```

Note that we should use the same modified script as we used in the bare metal
deployment. The container host is still going to send traditional process
management signals and the application should recognize them.

## Conclusion

`pm2` is a process manager that simplifies process management for developers
that may not have much knowledge of how systems manage processes. But it comes
with some inherent costs and caveats: namely it does not run applications in
an unaltered environment. We should take care to deploy our applications with
as little runtime environment changes as is necessary in order to reduce the
number of things we need to investigate when something goes wrong. By utilizing
the standard tooling we are able to run our applications with as little
interference as possible. And we also gain the benefit of anyone being able to
manage our applications through standard interfaces without having to learn
new setups and tools.


[pm2-readme]: https://github.com/Unitech/pm2/blob/311c53298448fc4575fc689c4943692a664373ad/README.md?plain=1#L35
[otel]: https://opentelemetry.io
[proc-manage]: https://en.wikipedia.org/wiki/Process_management_(computing)
[pid]: https://en.wikipedia.org/wiki/Process_identifier
[proc-container]: https://github.com/Unitech/pm2/blob/311c53298448fc4575fc689c4943692a664373ad/lib/ProcessContainer.js
[🐒🩹]: https://en.wikipedia.org/wiki/Monkey_patch
[pino-issues]: https://github.com/pinojs/pino/issues?q=is%3Aissue+sort%3Aupdated-desc+pm2+is%3Aclosed
[cluster]: https://nodejs.org/dist/latest/docs/api/cluster.html
[debian]: https://debian.org/
[ansible]: https://en.wikipedia.org/wiki/Ansible_(software)
[fastify-rec]: https://github.com/fastify/fastify/blob/e3a07eaa444d0e769802195816d4e1718c2fc9ea/docs/Guides/Recommendations.md#use-a-reverse-proxy
[haproxy]: https://www.haproxy.org/
[container]: https://en.wikipedia.org/wiki/Containerization_(computing)
[docker]: https://en.wikipedia.org/wiki/Docker_(software)


