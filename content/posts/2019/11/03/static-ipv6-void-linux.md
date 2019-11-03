---
title: Adding A Static IPv6 Address To A Void Linux Server
date: 2019-11-03T08:40:00-04:00
slug: static-ipv6-void-linux
---

First, a little background. At home, I am stuck with Comcast for an ISP.
Probably the _only_ redeeming quality of this is that they have fully rolled
out dual stack IPv4+IPv6 to all of their customers. Everyone on their network
gets personal access to more IPv6 addresses than ever existed in the whole
IPv4 space. They assign a `/128` to your WAN interface, and from there you can
request a `/64`, or in my case a `/60` to handle my multiple VLANs, for all of
your internal devices. So, last weekend I took the time to get IPv6 enabled
on my home network. Primarily to get my Xbox One X directly connected to the
Internet, but also, because it was something to do.

This weekend, on a lark, I checked with my VPS provider, [Vultr][vultr], to see
if they provide an IPv6 address for my server. Answer: yep! they provide a full
`/64`. The result is a couple hours of me adding IPv6 to the host that served
this website to you and this article detailing the things I learned.

[vultr]: https://www.vultr.com/?ref=6889759

## Implementation

[Void Linux][void] provides a very basic plaform upon which you can build
whatever system you like. For me, one particularly attractive aspect is that
I get to define my network configuration simply with [`/etc/rc.local`][rclocal]
and the [iproute2][iproute2] tools. So, while this article is techincally
specific to Void, the information should be easily applicable to any situation
where one is managing everything themselves instead of through higher level
tooling.

My previous IPv4 only `rc.local`:

```sh
ip addr add 45.63.16.142/8 brd 45.255.255.255 scope global dev eth0
ip link set up dev eth0
ip route add default via 45.63.16.1 dev eth0
```

My `rc.local` after adding my IPv6 configuration:

```sh
ip addr add 45.63.16.142/8 brd 45.255.255.255 scope global dev eth0
ip addr add 2001:19f0:5:23de:5400:00ff:fe1e:54e2/64 scope global dev eth0
ip link set up dev eth0
ip route add default via 45.63.16.1 dev eth0
```

A couple of things to notice here:

1. The difference is only one line: adding the IPv6 address to the interface.
2. IPv4 requires manual configuration of the gateway.

It's item #2 that makes things tricky. Whereas IPv4 reserves specific IPs for
specific purposes (broadcast and gateway) in each subnet, IPv6 does not. Instead,
it uses the [Neighbor Discovery Protocol][ndp] (NDP) to advertise, and learn
about, routers available on the network. Thus, only adding an IPv6 address
to the network interface will not accomplish anything useful. We need to
listen for router advertisement messages and use them to build our route
rules.

First, we need to be able to hear said advertisements. So we need to tweak the
system's firewall to allow ICMPv6 traffic:

```sh
ip6tables -I INPUT -j ACCEPT -p icmpv6
```

In the IPv4 world we are used to simply denying all ICMP traffic, or allowing
only very specific types of ICMP traffic. This is due to various remote attacks
via ICMP messages, but IPv6 relies on several ICMP messages to operate correctly.
Thus, we allow ICMPv6 traffic to pass through our firewall. Ultimately,
my `/etc/iptables/ip6tables.rules` file looks like:

```sh
*filter
:INPUT ACCEPT [0:0]
:FORWARD ACCEPT [0:0]
:OUTPUT ACCEPT [0:0]
-A INPUT -j ACCEPT -m state --state RELATED,ESTABLISHED
-A INPUT -j ACCEPT -p tcp -m tcp --dport 80
-A INPUT -j ACCEPT -p tcp -m tcp --dport 443
-A INPUT -j ACCEPT -p icmpv6
-A INPUT -j REJECT --reject-with icmp6-adm-prohibited
-A FORWARD -j REJECT --reject-with icmp6-adm-prohibited
COMMIT
```

The finaly piece of this puzzle is _actually_ listening for the router
advertisement messages. This is accomplished through the [ndppd][ndppd]
daemon:

1. `xbps-install -y ndppd`
2. `echo "proxy eth0 {}" > /etc/ndppd.conf`
3. `ln -s /etc/sv/ndppd /var/service`

Done! At this point all that is left is to update service configurations
to listen on the IPv6 address in addition to the IPv4 address. For example,
the HTTP frontend in my [HAProxy][haproxy] config required one new line:

```conf
frontend proxy
   bind 45.63.16.142:80
   bind 2001:19f0:5:23de:5400:ff:fe1e:54e2:80 v6only
   use_backend default-server
```

Well, there is one more thing: don't forget to add a `AAAA` record in your DNS.

[void]: https://voidlinux.org/
[rclocal]: https://web.archive.org/web/20191103125931/https://docs.voidlinux.org/config/network/static.html
[iproute2]: https://en.wikipedia.org/wiki/Iproute2
[ndp]: https://en.wikipedia.org/wiki/Neighbor_Discovery_Protocol
[ndppd]: https://github.com/DanielAdolfsson/ndppd
[haproxy]: https://www.haproxy.org/

## Conclusion

Getting IPv6 enabled is really not difficult. The difficult part was tracking
down all of the information. Pretty much every article I could find assumed
the underlying distribution was already taking care of the details for you.
None of them actually outlined the constituent parts those distributions use
to make things work. The key was researching how router advertisements are
handled by _clients_ on an IPv6 network (routers would be using `radvd` instead
of `ndppd`). I hope this article clears things up for others looking to do
implement things on their own.
