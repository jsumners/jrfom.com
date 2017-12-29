---
title: Switching To Void Linux On My HTPC
date: 2016-01-10T17:15:00-05:00
slug: switching-to-void-linux-on-my-htpc
---

In 2008 I built myself a [HTPC][htpc]. It started out running
[Arch Linux][arch] but switched to [Ubuntu][ubuntu] when Arch decided to force
systemd. Ubuntu's [Upstart][upstart] didn't live up to Arch's original RC
system, but it fit the bill of *not* being systemd. I have never liked Ubuntu
so it was most certainly a stop-gap solution. My replacement for Ubuntu is
[Void Linux][void].

I discovered Void a few months ago when [Debian][debian] decided to force
systemd as well. Once that happened I did [some digging][search] on
[Distrowatch][dw] for distributions that didn't include systemd (aside:
technicall I did a search for distros with a specific init system, but that
doesn't seem possible at the time of this writing). After researching a few on
the list it was clear to me that Void Linux would be my new distribution of
choice. The release model is very much like Arch's, makes a point of *not* using
[OpenSSL][openssl] by using [LibreSSL][libressl] instead, and uses
[Runit][runit] for the init system.

> Regarding LibreSSL over OpenSSL: look back at the early posts of
> [opensslrampage.org][rampage]. [It's][cipher] [very][optimism] [illuminating][30days].

Runit is rather amazing in its simplicity. The flexibility of systemvinit is
still present, but there's pretty much no reason to have more than 5 lines
in a Runit init script; still, there are [crazy people][crazy] out there. The
short of it is Runit doesn't fork processes. It simply starts a process and
waits for it to exit. If the process does exit, Runit restarts. So a complete
init script can be:

```bash
#!/bin/sh
mkdir -p /run/samba
exec smbd -F -S
```

That simple script is all that is necessary to start [Samba][samba]. Compare
that to a traditional sysv [init script][sambav] or a [systemd script][sambas]
and you'll see why this is so great.

So, getting back to my HTPC. Reinstalling the base OS with Void was very easy.
And installing everything I needed to run my interface ([Kodi][kodi]) was
even easier:

```bash
$ xbps-install kodi xorg x11vnc
```

Now, at this point there's always some trickery needed to get the system to
boot straight to Kodi. This time was no exception. Initially I thought I'd be
able to get by with [a guide][guide] on the Void wiki. But that didn't pan out:
the guide assumes the user will only ever be used for logging in straight
to X11. I need to SSH to the system as that user on a regular basis, so that
assumption wouldn't work.

When I originally built my HTPC back in 2008 there was a [display manager][disp]
that supported automatic logins without much hassle (I can't recall which one).
But that got replaced with [SLiM][slim]. SLiM supported automatic logins, but
only on the *first* login. If whatever program you were running, Kodi in this
case, crashed then you'd be staring at login screen. Who wants to get out a
keyboard and mouse to use an entertainment system? Not me. I searched for
a solution and found none, so I wrote my own tool for the job. If you've read
this site for a while you may have seen it listed as "mythlogin", as I
originally used [MythTV][myth]. Since the guide's method of automatic login
wouldn't work for me I once again turned to my tool. This time I've renamed
it [autox][autox]; this tool will be in the official Void respository likely
by the time you read this.

I originally wrote *autox* to be used on a sysvinit system with an
[inittab][inittab]. When I switched to Ubuntu it turned out using *autox* was
almost just as easy. But under Runit? It wasn't so easy:

1. autox doesn't *truly* log a user in to the system. It merely sets up his
   regular environment with all of his [PAM][pam] granted permissions, e.g.
   real-time clock access.
2. simply using [agetty][agetty] as the guide does results in the process being
   launched outside of Runit's supervisor proccess. That's no good since we
   want Runit to manage the process.

Digging in to how Void sets up ttys I learned about a tool I hadn't heard of
before -- [setsid][setsid]. Combining `setsid` with `agetty` did the trick.
The resulting Runit script for my HTPC:

```bash
#!/bin/sh

sv start wpa_supplicant
exec 2>&1
exec setsid -w agetty -a htpc -n -l /usr/bin/autox -o htpc tty7 38400 linux
```

Wait. What is line number three? That's how you define a dependent service
under Runit. Instead of some convoluted descriptor file like Upstart and
systemd want you just start the required service. In this case I need network
access and my HTPC is only connected via 802.11n currently. So I need to
authenticate to my access point prior to launching Kodi since Kodi uses the
Internet.

There was one other problem, though. I use x11vnc to make X11 accessible from
my other computers. This is handy when I need to do something with Kodi that
would be a chore with just an IR remote. I had been using my `.xinitrc` file
to launch x11vnc. I was using `exec` to fork it off into its own process in
the background. Well, do that under this new configuration resulted in x11vnc
running outside of Runit's supervisor process. Again, not good. Solution?
Runit:

```bash
#!/bin/sh
sv start kodi
exec x11vnc -many -q -avahi -ncache 10 -passwd super_secret
```

Again, since x11vnc is dependent on X11 being already up and running I just
invoke the `kodi` service before hand. Simple.

Finally, there is one other piece of my HTPC puzzle. I use [nzbget][nzbget]
for some things. And I let it run on my HTPC as the "htpc" user. Under the
previous init systems it wasn't worth the hassle to define it as a system
service. So I wrapped it in a [screen][screen] script and launched it manually
every time I had to reboot my HTPC (which isn't often). But there's a pretty
cool feature of Runit -- [user services][userserv]. No more manually starting
nzbget!:

```bash
#!/bin/sh
exec 2>&1
exec /bin/nzbget --server
```

With that run script and `/home/htpc/{sv,service}` I can let Runit take care
of starting and stopping it. All while not having to jump through a bunch of
hoops to start it as a specific user. This is something I'd love to use at work,
but I'm stuck with RedHat and I'm not going to put another init system on top
of an existing one (maybe).

Anyway, the point of this post was mainly to highlight Runit and Void Linux.
They are a great combination for an appliance system like an HTPC. Such a system
doesn't need a lot of resources, but it is better to give the actual application
the majority of the resources. With Void and Runit your application gets
almost *all* of the system resources. I'll end this post with the stats
on my HTPC's currently used resources:

```
% free -h                                                                                                                                                   [s:127 l:385]
              total        used        free      shared  buff/cache   available
Mem:           7.7G        475M        2.8G         57M        4.4G        7.1G
Swap:            0B          0B          0B

% ps_mem                                                                                                                                                 [s:1 l:392]
 Private  +   Shared  =  RAM used	Program

 92.0 KiB +  23.5 KiB = 115.5 KiB	nanoklogd
100.0 KiB +  26.0 KiB = 126.0 KiB	socklog
124.0 KiB +  38.0 KiB = 162.0 KiB	uuidd
132.0 KiB +  71.5 KiB = 203.5 KiB	kodi
180.0 KiB +  38.5 KiB = 218.5 KiB	acpid
176.0 KiB +  73.0 KiB = 249.0 KiB	runsvdir (2)
192.0 KiB + 132.0 KiB = 324.0 KiB	sh (2)
216.0 KiB + 169.0 KiB = 385.0 KiB	autox (2)
200.0 KiB + 236.0 KiB = 436.0 KiB	xinit
448.0 KiB + 166.0 KiB = 614.0 KiB	svlogd (5)
448.0 KiB + 219.0 KiB = 667.0 KiB	agetty (4)
704.0 KiB +   4.0 KiB = 708.0 KiB	runit
740.0 KiB + 272.0 KiB =   1.0 MiB	login (2)
932.0 KiB + 132.5 KiB =   1.0 MiB	sudo
  1.0 MiB +  90.5 KiB =   1.1 MiB	udevd
  1.4 MiB + 506.5 KiB =   1.9 MiB	runsv (19)
  1.6 MiB + 395.0 KiB =   1.9 MiB	wpa_supplicant
  2.3 MiB + 109.5 KiB =   2.4 MiB	most
  2.6 MiB + 461.5 KiB =   3.1 MiB	mandoc
  2.9 MiB + 437.5 KiB =   3.3 MiB	nmbd
  1.2 MiB +   2.7 MiB =   3.9 MiB	sshd (5)
  4.2 MiB +   4.3 MiB =   8.5 MiB	smbd (2)
  7.6 MiB +   1.3 MiB =   8.9 MiB	mosh-server (2)
 12.2 MiB + 562.5 KiB =  12.8 MiB	x11vnc
 11.1 MiB +   2.4 MiB =  13.6 MiB	zsh (6)
 14.9 MiB + 811.0 KiB =  15.7 MiB	nzbget
 29.2 MiB +   1.8 MiB =  31.0 MiB	Xorg
411.8 MiB +   5.2 MiB = 417.0 MiB	kodi.bin
---------------------------------
                        531.1 MiB
=================================

% pstree                                                                                                                                                      [s:0 l:386]
runit─┬─2*[mosh-server───zsh]
      └─runsvdir─┬─runsv─┬─socklog
                 │       └─svlogd
                 ├─4*[runsv───agetty]
                 ├─runsv───sshd─┬─sshd───sshd───zsh
                 │              └─sshd───sshd───zsh───pstree
                 ├─runsv───uuidd
                 ├─runsv───login───zsh
                 ├─runsv───smbd───smbd
                 ├─runsv───nanoklogd
                 ├─runsv─┬─svlogd
                 │       └─wpa_supplicant
                 ├─runsv─┬─mythlogin───autox───sh───xinit─┬─Xorg───{Xorg}
                 │       │                                └─sh───kodi───kodi.bin─┬─{AESink}
                 │       │                                                       ├─{ActiveAE}
                 │       │                                                       ├─{AirPlayServer}
                 │       │                                                       ├─{EventServer}
                 │       │                                                       ├─{FDEventMonitor}
                 │       │                                                       ├─23*[{LanguageInvoker}]
                 │       │                                                       ├─{PeripBusUSBUdev}
                 │       │                                                       ├─{TCPServer}
                 │       │                                                       ├─17*[{kodi.bin}]
                 │       │                                                       └─2*[{libmicrohttpd}]
                 │       └─svlogd
                 ├─runsv───login───zsh───man───most
                 ├─runsv───nmbd
                 ├─runsv───udevd
                 ├─runsv───acpid
                 ├─runsv─┬─svlogd
                 │       └─x11vnc
                 └─runsv───runsvdir───runsv─┬─nzbget───6*[{nzbget}]
                                            └─svlogd
```



[htpc]: https://en.wikipedia.org/wiki/Home_theater_PC
[arch]: https://www.archlinux.org/
[ubuntu]: http://www.ubuntu.com/
[upstart]: http://upstart.ubuntu.com/
[void]: http://www.voidlinux.eu/
[debian]: https://www.debian.org/
[search]: http://distrowatch.com/search.php?pkg=systemd&pkgver=&distrorange=NotInLatest#pkgsearch
[dw]: http://distrowatch.com/
[openssl]: https://en.wikipedia.org/wiki/OpenSSL
[libressl]: https://en.wikipedia.org/wiki/LibreSSL
[runit]: http://smarden.org/runit/
[rampage]: http://opensslrampage.org/
[cipher]: http://opensslrampage.org/post/96025631325/does-sslcipherdescription-return-an-allocated
[optimism]: http://opensslrampage.org/post/91771553861/kill-optimism-in-docs
[30days]: http://www.openbsd.org/papers/eurobsdcon2014-libressl.html
[crazy]: https://bitbucket.org/avery_payne/supervision-scripts/wiki/Home
[samba]: https://www.samba.org/
[sambav]: http://pkgs.fedoraproject.org/cgit/rpms/samba.git/tree/smb.init?h=f16
[sambas]: http://pkgs.fedoraproject.org/cgit/rpms/samba.git/tree/smb.service?id=3d3cbc8a73664be88a2ca7e9af5dfcde1778722d
[kodi]: http://kodi.tv/
[guide]: https://wiki.voidlinux.eu/Automatic_Login_to_Graphical_Environment
[disp]: https://en.wikipedia.org/wiki/X_display_manager_(program_type)
[slim]: https://en.wikipedia.org/wiki/SLiM
[myth]: https://www.mythtv.org/
[autox]: https://github.com/jsumners/autox
[inittab]: http://linux.die.net/man/5/inittab
[pam]: https://en.wikipedia.org/wiki/Linux_PAM
[agetty]: http://linux.die.net/man/8/agetty
[setsid]: http://man7.org/linux/man-pages/man1/setsid.1.html
[nzbget]: http://nzbget.net/
[screen]: https://en.wikipedia.org/wiki/GNU_Screen
[userserv]: http://smarden.org/runit/faq.html#userservices
