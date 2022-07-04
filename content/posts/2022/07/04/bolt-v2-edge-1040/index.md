---
title: Wahoo Elemnt Bolt vs Garmin Edge 1040
date: 2022-07-04T16:30:00-04:00
lastmod: 2022-07-04T16:30:00-04:00
slug: bolt-v2-edge-1040
---

This article is for the people using the [Wahoo Bolt v2][boltv2] and considering
the [Garmin Edge 1040][edge1040]. This is not a long term review of either unit;
for that see [DC Rainmaker's](https://www.dcrainmaker.com) reviews: [Bolt
v2][boltv2-rain] and [Edge 1040][edge1040-rain]. The short summary is: the Edge
1040 is a better computer all around, and definitely worth it for people who
want to actually train.

## Wahoo Bolt (v2)

I already have a few thoughts jotted down in my post on
[Wahoo products]({{< ref "wahoo-thoughts" >}}) in general. To summarize those
thoughts: I want to support a local Atlanta business, I like their approach
to things, but there are a lot of rough edges. It's those rough edges that
caused me to change computers and write this post.

[Saturday, July 2, 2022](https://www.strava.com/activities/7404339550) was the
last time I used this computer. At my 60 mile rest stop, I was fed up enough
that I ordered the Edge 1040 before I got back on my bike. It seems like every
new firmware the device gets worse and worse. For a long time, it was reading
the ambient temperature wildly wrong; some recent firmware seems to have
fixed that one. On Saturday, the things that got me upset were:

1. It takes literal minutes for the computer to pick up my devices at the
start of a ride. In particular, it takes a long time for my [Rally XC200][rally-xc]
pedals to be found. Once found, it's a lottery to see if the computer will
actually zero them; usually taking two or three tries.
2. The instant velocity readings were all over the place. It'd read 11mph and
then 30mph in the span of a few feet. It has become impossible to rely on the
thing to know how fast I'm traveling at any point in time. The only accurate
reading is at the end when the miles are divided by total ride time.
3. Some point between mile 40 and mile 60 the computer auto-paused for several
seconds while I was traveling at least 15 to 20mph. This was the last straw.

Yes, I was on the latest firmware: WA39-14983. Point 1 has been an issue for
months, and the pedal syncing has been the case since day one with the pedals.
Point 2 is a recent development, but present over several firmware versions.
I am sure point 3 is tied to point 2, but I don't care.

### The Good Parts

All of that said, I really like the Bolt computer. I don't need a lot out of a
bike computer. I mainly use them to keep track of basic stats so that I can
see my improvement over time. I do not ride regimented training plans, because
I do not particpate in races; I'm just out to keep fit and have fun.

The Bolt is a simple, focused, computer that is very easy to use. The things
I like about it over the Edge 1040 are:

1. The screen: there's no question that the Bolt's screen is better. It's far
easier to read in direct sunglight and scattered sunlight (overhead tree
canopy).
2. The coloring of fields to indicate difficulty/work zone. In particular, the
elevation gradient, heart rate, and power meter fields.
3. Easy to use buttons.
4. The start/pause feature is way easier to work with.

The gallery below shows the primary pages I use on the Bolt, the features I
describe above, and what a post ride summary on the device looks like.

{{< image-gallery namePattern="bolt/*.jpeg" />}}

## Garmin Edge 1040 (Solar)

First off, bear in mind that I have used this computer for a total of one ride.
Again, this is not a long term review. It's my impressions as someone moving
from one ecosystem to the other; I have never used any bike computer other
than the Wahoo Bolt series prior to this Garmin computer. That said:

Wow. This computer is in a different league. It is clear to me that the Edge
1040 is the computer to get, between the two, if you are someone that is looking
for a computer to train with. All of its features are geared to the serious
athlete that is riding specific training plans.

I was able to replicate my main primary screen from the Bolt, and the screen
where I can see my power and left-right balance information, but too many fields
were lacking to recreate the other pages. That, or I could not get the Edge
to use the correct field. For example, I should be able to recreate my elevation
page, but the Edge refuses to put the graph in place and instead shows the
current elevation, e.g. 4,000ft. The built-in elevation page is a pretty good
substitute, it just doesn't have the current 3s power field that I like to have.

The lack of fields doesn't seem to be a limitation of the device, though. It
seems to be a limitation of the firmware. I may write Garmin to ask for the
missing fields, e.g. "max heart rate" and "avg heart rate". But if they don't
add them, there is the [Connect IQ SDK][sdk]. While I really don't want to have
to write my own code to get stuff on the computer, it's _very_ nice to have
the option. There is not even the hint of an SDK available for the Wahoo Bolt.
And there are a few apps in the Connect IQ store that look pretty good and show
that there is a lot more functionality possible.

The parts I like about the Edge 1040 are:

1. It's fast. Way, _way_, faster than the Bolt. It powers on to the home screen
in under 12 seconds. The Bolt takes about 38 seconds.
2. Over my [40 mile ride](https://www.strava.com/activities/7414078946) with
the computer, it used about 4% battery. Really not bad. I think the Bolt uses
about the same, maybe a few percent more over the same ride.
3. _All_ of my sensors pair up in about 2 total seconds. A significant
improvement over the minute or more on the Bolt.
4. Really good integration with the Varia Radar and Rally XC200 pedals. Yes,
that _should_ be the case since they are all made by the same manufacturer, but
it's still very nice to have on computer control of things like what mode the
light is in. I don't really fault Wahoo here; but maybe I would if I were to
dig in to the ANT+ protocol and see if Garmin is keeping things from Wahoo or
if Wahoo is ignoring available features. Can't say.
5. Strava segements support is actually useful instead of completely annoying.
Whereas the Bolt, if I remember correctly, takes over the screen for every
segment you come across, the Edge only does that for short segments and it
_only_ tracks segments you have starred in Strava. On the longer, multiple
mile, segments, the Edge just gives a report at the end and leaves your main
display alone. I may actually leave this feature on, unlike with the Bolt where
I turned it off as fast as I could.
6. The map page loads as fast as any other page. On the Bolt, I would only turn
the map page on when I was riding an unfamiliar route and needed turn-by-turn
directions. Every time I turned it on, though, I would forget to turn it off
and I would get frustrated on my normal rides because paging through and hitting
the map page meant waiting for the device to struggle to load the map. The Edge
just shows it immediately. There's no reason to turn the page off on this
computer.
7. The damn thing did what it is supposed to do for the whole ride from start to
finish. It connected all of my sensors quickly at the start, tracked velocity,
and other metrics, correctly throughout the ride, and did not randomly decide to
pause.

The parts I'm less thrilled with:

1. The solar charging. Honestly, it's a gimmick and not worth it. You _might_
get a few more minutes of charge out of it if you are someone that forgets to
charge their devices regularly. I always charge my devices on Friday, so I don't
really need the solar charging feature. Over my 40 mile ride, on the Silver
Comet which has a lot of shade, I got a little over a minute of extra charge.
It also stops charging from the Sun if the device is too hot. So, it's not like
you can just leave it in direct sunlight and expect to get a full charge out
of it.
2. The display. It's way too susceptible to glare, particularly in broken
sunlight. The text is large and easy to read otherwise, but it's much, _much_,
easier to glance down and actually read the screen of the Bolt (aside from the
small text).
3. The touch screen. I like it a lot better than I thought I would, but it's
still a touch screen on a device that gets sweat on it. It does surprisingly
well in the rain, https://www.youtube.com/watch?v=U1UQPQ8AQqk, but I had to
wipe sweat off it during my ride and it resulted in the pulldown screen showing
up.
4. The start/pause is not as clear as with the Bolt. It's just a thing that will
take getting used to, but I do like it better on the Bolt.
5. Configuration. There are a lot of features on this computer. The result is
a confusing mess of menus to get lost in. Both on the device and in the phone
app.
6. It feels way more likely to suffer damage from an accidental drop than the
Bolt. The Bolt is quite rugged. I do not get the same impression with the Edge.

The gallery below shows the primary screen I used while riding, and the post
ride summary screens.

{{< image-gallery namePattern="edge/*.jpeg" />}}

## Summary

In short: as a long time Wahoo Bolt user, I am quite happy with the Garmin Edge
as a replacement. It's a much more robust computer, in size, feature set, and
operation. Even for a basic user like myself, it does everything one would want
it to do. But I do not recommend wasting money on the Solar version; get the
standard version.

[boltv2]: https://web.archive.org/web/20220331003006/https://www.wahoofitness.com/devices/bike-computers/elemnt-bolt
[boltv2-rain]: https://web.archive.org/web/20220505134126/https://www.dcrainmaker.com/2021/05/wahoo-elemnt-bolt-v2-2021-with-color-screen-maps-a-review-in-progress.html
[edge1040]: https://web.archive.org/web/20220702104012/https://www.garmin.com/en-US/p/731136
[edge1040-rain]: https://web.archive.org/web/20220608172335/https://www.dcrainmaker.com/2022/06/garmin-edge-1040-with-solar-in-depth-review.html
[rally-xc]: https://web.archive.org/web/20220404111255/https://www.garmin.com/en-US/p/658594
[sdk]: https://developer.garmin.com/connect-iq/sdk/
