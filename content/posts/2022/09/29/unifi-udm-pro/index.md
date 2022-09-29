---
title: Using A Unifi UDM-PRO At Home
date: 2022-09-29T17:30:00-04:00
lastmod: 2022-09-29T17:30:00-04:00
slug: unifi-udm-pro-at-home
---

In August of 2017 I acquired my first [Unifi][unifi] gear: an 8 port 60W PoE
switch, and the UAP-AC-PRO wireless access point. I paired them with a box I
built that was running [pfSense][pfsense], and was able to setup VLANs for my
regular network traffic and Internet of Things (IoT) traffic. This worked
great. I was able to use [vnStat][vnstat] to keep track of my monthly data
usage (since I refused to pay Comcast their extortion fee to get an uncapped
connection), and generally do everything I needed.

Fast forward to March 2021 and some [shenanigans][shenanigans] with pfSense,
FreeBSD, and WireGuard made me want to get off of pfSense and at least move
to [OPNsense][opnsense]. But that would be a lot of work, and I kept putting
it off. I considered switching to the Unifi [UDM-PRO][udm-pro] at the time
as well, but the folks at Ubiquiti can't seem to grasp the concept of vnStat
and why anyone would need it. So it was off the table...

Until my previous employer started paying a $100/mo ISP stipend. I kept running
up against Comcast's stupid cap, so I decided to use the stipend to pay my
regular ISP bill plus their extortion fee. So the need to track my data usage
was removed, but it was still going to be a lot of work to switch from my own
router/gateway to the UDM-PRO, and so I kept putting it off...

Until in late July of this year my pfSense box started acting up. It was clear
the hardware was reaching its limit so I needed to at least perform a rebuild.
I decided that this would be my opportunity to switch to the UDM-PRO, and this
article is about the work I have had to do to get it into a state approximating
what I had with off-the-shelf components and a free operating system.

## Prosumer But Lacking

I like the Unifi gear because there isn't any other "prosumer" gear out there
that provides an [SDN][sdn] ecosystem that even remotely compares. In general,
the Unifi stuff "just works" and has a good interface for configuring it. That
remains true of the UDM-PRO. Switching to it was basically:

1. Pull out the old box
1. Put in the new gateway
1. Add ISP credentials
1. Reconfigure VLANs to not be tagged only (since pfSense was managing them before)

But what I lost was:

1. A local domain with split authoritative and recursive DNS lookup:
    * In short, I have a domain that I consider my "home domain". In other words,
    all of my devices name themselves within it and it serves as an address to
    reach my home network. pfSense would automatically register devices under
    this domain, serve out DNS entries for them, and issue a recursive lookup
    for any queries that didn't match the local authoritative database. The
    UDM-PRO uses the exact same tool for the local DNS proxy that pfSense uses,
    but totally ignores this scenario.
1. Easy management of DHCP
    * pfSense had a central DHCP configuration panel, with sections for each
    subnet. This made it really easy to configure each subnet, and to configure
    "static" addresses for specific clients. With the UDM-PRO, you have to
    navigate to each device and dig through a properties menu to add a static
    address for it. You also do not get a simple overview of all the DHCP
    configuration and reserved addresses.
1. Easy on-gateway tooling to inspect and diagnose the ISP connection
    * With pfSense it was very easy to see the ISP assigned IP addresses and the
    assigned nameservers. The only thing the UDM-PRO shows is the IPv4 ISP
    assigned address. And pfSense included a web UI for tools like `ping` or
    `traceroute` to easily diagnose problems from the gateway. The UDM-PRO doesn't
    provide anything of this sort.
1. Easy dynamic DNS management
    * Supposedly the UDM-PRO works with various dynamic DNS services, including
    the one I used, afraid.org, but the configuration tool is extremely bare
    bones and completely undocumented. I could never figure out how to use it
    correctly, and gave up on it.

## DNS

I need to expand on the DNS problem above. It's really bad. It doesn't take much
searching to find many people complaining about the whole of the time the
UDM-PRO has been in existence. I understand Ubiquiti's perspective: the device
is really meant to be a gateway in a small office or enterprise. As such, they
expect you'd have your own servers providing this service. But even in that
scenario, their competition is literally pfSense/OPNsense. And, as I have
shown, this is a very easy included feature in those products. Ubiquiti needs
to wake up and start listening to their customers (and this is just one case
of several in which that statement holds).

Initially, I attempted to solve this problem for myself by building a
[Docker][docker] service to provide the DNS setup I described above. It's
available at https://github.com/jsumners/udm-dns. But after getting that setup
I discovered a complication: I run a dual-stack IPv4 and IPv6 network. The
issue there is that most operating systems and devices, in particular macOS,
search for IPv6 DNS entries first. Since that `udm-dns` project can only provide
IPv4 DNS (easily), I was left with slow and outright failing DNS lookups after
configuring the UDM-PRO to assign clients a primary nameserver pointing to
that service.

So I had to temporarily disable it.

## Fixing My Problems

Most people go about fixing these sort of problems by installing services
directly on their UDM-PRO. The software features of the device are built upon
Docker ([podman][podman]), and it has some fairly capable hardware specs. But
I haven't done that. I don't want to risk my changes being lost in a device
upgrade, and I'd rather the gateway devote all of its resources to the things
it is purports to support.

Instead, I bought an [HP EliteDesk 800 G3][hp] for a couple hundred bucks at
my local Microcenter to serve as a home server until I am ready to buy some
variant/build of a [Supermicro][supermicro] that will actually fit in my rack.
Over the past two months, as time and desire has permitted, I have been building
up this home server to fill in all of the gaps that the UDM-PRO has. The result
is https://github.com/jsumners/home-server.

That project:

1. Provides local authoritative + recursive DNS on both IPv4 and IPv6. The IPv6
support is handled through usage of a [ULA network][ula] so that I can manually
assign easy to remember static addresses (mainly just the home server's
interface) and let other devices pick up automatic addresses through router
advertisement. This DNS server also picks up any clients connected to my
network by querying the UDM-PRO to get their addresses and names via
https://github.com/jsumners/udm-pro-api-client.
1. Removes the need for afraid.org and updates whatever dynamic domains I want
directly with my registrar through https://github.com/jsumners/gandi-dyndns.
1. Provides a local TLS terminating proxy that I can use for all of my internal
services and any that I care to expose publicly.
1. Backs up any events recorded by the [Unifi G4 camera][g4camera] I added to
the system. Yet another failing by Ubiquiti. It should be very obvious to
anyone that recordings need to be backed up offsite as quickly as possible.
But the UDM-PRO doesn't offer that functionality, and it had to be patched in
with https://github.com/ep1cman/unifi-protect-backup (which is authored by
a very helpful developer and provides way more functionality than I'm sure
Ubiquiti ever will if they wake up and implement anything).

## Summary

I genuinely like the Unifi gear. But I really wish Ubiquiti had some real
competition to make their products better. This project was really not one I
wanted to take on. But hopefully others can get a head start from my work if
they decide to build out on the Unifi line with the UDM-PRO as their center
piece.

[unifi]: https://ui.com/
[pfsense]: https://www.pfsense.org
[vnstat]: https://en.wikipedia.org/wiki/VnStat
[shenanigans]: https://web.archive.org/web/20220903111305/https://arstechnica.com/gadgets/2021/03/buffer-overruns-license-violations-and-bad-code-freebsd-13s-close-call/
[opnsense]: https://opnsense.org
[udm-pro]: https://store.ui.com/products/udm-pro
[sdn]: https://en.wikipedia.org/wiki/Software-defined_networking
[docker]: https://en.wikipedia.org/wiki/Docker_(software)
[podmain]: https://podman.io
[hp]: https://www.amazon.com/HP-EliteDesk-800-triple-level-Bluetooth/dp/B01N3AL7TC
[supermicro]: https://www.amazon.com/Supermicro-Mount-Server-Chassis-CSE-505-203B/dp/B0093HNUD0
[ula]: https://en.wikipedia.org/wiki/Unique_local_address
[g4camera]: https://store.ui.com/collections/unifi-protect/products/uvc-g4-pro
