---
title: First Project With A Raspberry Pi
date: 2020-08-30T12:35:00-04:00
slug: first-rpi-project
---

For some time, I have been wanting to replace my self-built router with a
[Unifi Gateway][usgw] so that I could build a [Docker][docker] server out of
that system. Unfortunately, the Unifi Gateway continues to lack a feature I
need: monthly bandwith usage tracking. Until it at least gains that feature,
I will be sticking with [pfSense][pfsense]. But there are at least two things
that I really need a Docker server for:

* Running the Unifi management app via https://github.com/jacobalberty/unifi-docker
* Running a [localtunnel][localtunnel] server

As I was mulling over this problem, it occurred to me that these use cases
do not require tremendous resources. So I decided to make my first project
with a [Raspberry Pi][rpi] be a project to turn one into a Docker server.
This post details my experience and setup, because it hasn't been easy.

## Parts List

* [RPI 4 B (8GB)](https://web.archive.org/web/20200828214703/https://www.microcenter.com/product/622539/4_Model_B_-_8GB_DDR4)
* [64GB Memory Card](https://web.archive.org/web/20200828214836/https://www.microcenter.com/product/615250/64GB_Canvas_Select_Plus_MicroSDHC_Class_10-_UHS-1_Flash_Memory_Card_w-_Adapter)
* [HDMI to micro-HDMI adapter](https://web.archive.org/web/20200828215016/https://www.microcenter.com/product/608458/6_in_34AWG_High_Speed_HDMI_Cable_With_Ethernet_Port_Saver)
* [Power cable](https://web.archive.org/web/20181004095419/http://www.microcenter.com/product/461761/micro_usb_wall_charger)
* [HDMI to micro-HDMI cable](https://web.archive.org/web/20200828215631/https://www.microcenter.com/product/608177/Micro-HDMI_to_Standard_HDMI_(A-M),_1m_cable)
* [PoE Hat](https://web.archive.org/web/20200828215917/https://www.amazon.com/gp/product/B07XB5PR9J)
* [Vesa Mount](https://web.archive.org/web/20200828220019/https://www.amazon.com/gp/product/B079J5SFYS)

Not all parts in this list were useful. Keep reading for details.

## Initial Issues

I naively thought this would be a simple project: buy a Pi, slap an OS on it,
install my stuff, and done. Not so. After getting all of my initial parts
together, I went to plug everything in and get started. Oops. The RPI4 is
powered via USB-C, not micro-USB-B. So the power cable I bought turned out
to be useless and I had to return it. Resolution: power the RPI4 via a USB-C
cable connected to my laptop.

Now that the device is getting power, I discover my second problem: no display.
I tried updating the [`config.txt`](configtxt) several times to get the display
working. Nothing helped. So I ordered a direct HDMI-to-micro-HDMI cable and
put the project aside for a couple of days. After getting the cable, plugging
it in, and powering on the RPI: boom! I had a boot screen.

## Post Boot Issues

Now that I had a booting RPI4, I started configuring it. I used the
[`raspi-config`][raspi-config] tool to set all of my basic settings and rebooted
the system to find that it would not connect to my wireless network. Everything
looked correct, but since the official RPI OS is based upon Debian, everything
was obscurred by systemd. I did some basic log inspection, but couldn't find
any relevant error messages. So I decided to check if [Void Linux][void] would
work. Turns out, not quite.

Void, at this time, only has pre-built images for the Raspberries 1, 2, and 3.
They do not have an image for the RPI4. However, someone had figured out how
to build such an image. So I started working on that.

## Building A Void Linux Image

The patch and instructions for building the image are at:
https://github.com/void-linux/void-packages/pull/23541

Unfortunately, Void moves fast and those instructions resulted in merge
conflicts. So here's my tweaked instructions:

1. Directly clone the `void-packages` repo.
2. Directly clone the `void-mklive` repo.
3. Create a new branch in the `void-packages` repo.
4. Apply the Pull Request's changes manually since they are few.
5. Follow the rest of the instructions as printed.

I recommend doing all of this in a virtual machine with a fresh install
of Void Linux as the working environment. It is going to take a _long_ time
to complete all of this. There will be several cross compliation and build
stages.

<aside>
  If you trust me, you can download the image I built. But hopefully Void
  will get their build process updated to include RPI4 by default. Definitely
  check to see if that is case at the time of reading this before attempting
  to use this image:
  <a href="https://keybase.pub/jsumners/rpi4/void-rpi4-20200828.img.xz">
    https://keybase.pub/jsumners/rpi4/void-rpi4-20200828.img.xz
  </a>
</aside>

After building the image and flashing it to the memory card, I mounted the
`/boot` FAT32 partition and replaced the `config.txt` with the one from the
official image:
[https://keybase.pub/jsumners/rpi4/config.txt](https://keybase.pub/jsumners/rpi4/config.txt).

## Void Is Live!

The Void based card booted (and a helluva log quicker than that systemd based
nonsense, too), I edited `/etc/wpa_supplicant/wpa_supplicant.conf` to add my
network configuration, enabled the `wpa_supplicant` service, and I immediately
had a working wireless connection. Success!

First things first, resize the root partition:

1. `xbps-install parted`
2. `parted` and then `resizepart 2 62GB`
3. Quit `parted`
4. `resize2fs /dev/mmcblk0p2`

Next, try to install Docker... Sadness! A pre-built package is not availble:
[https://github.com/void-linux/void-packages/issues/18062](https://github.com/void-linux/void-packages/issues/18062).

At this point, the system was usable, but due to lack of community support, some
work had to be done to get everything where I wanted it. Mostly, this just meant
setting up a build environment on the Pi so that I could build the Docker
packages. After that, it was all normal system setup. What this meant for me,
was getting the ethernet NIC configured for the IP address I wanted to give it
and then mounting it in its permanent location. That way I could do the
remainder of the work headless over SSH.

[usgw]: https://web.archive.org/web/20200627121804/https://www.ui.com/unifi-routing/unifi-security-gateway-pro-4/
[docker]: https://en.wikipedia.org/wiki/Docker_(software)
[pfsense]: https://en.wikipedia.org/wiki/PfSense
[localtunnel]: https://github.com/localtunnel/localtunnel
[rpi]: https://en.wikipedia.org/wiki/Raspberry_Pi
[configtxt]: https://web.archive.org/web/20200808043054/https://www.raspberrypi.org/documentation/configuration/config-txt/README.md
[raspi-config]: https://web.archive.org/web/2/https://www.raspberrypi.org/documentation/configuration/raspi-config.md
[void]: https://voidlinux.org/
