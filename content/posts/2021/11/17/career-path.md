---
title: My Career Path To Date
date: 2021-11-17T20:45:00-05:00
lastmod: 2022-05-07T19:30:00-04:00
slug: career-path
---

Today, I received a private message on Twitter:

> 'A software engineer with a background in Linux server administration' - This
> is music to my ears because I am trying to forge a similar path. Let me know
> if you have any tips.

It was in reference to the current tagline I have on my resume site,
[james.sumners.info](https://james.sumners.info/). I responded with a very short
summary, but I realized that I haven't written about it here. I thought I had in
[A New Carerer]({{< ref "a-new-career" >}}) or even [A Rumination On A
Promotion]({{< ref "a-promotion.md" >}}) (I touched on it, but only from the
perspective of how trepidatious it can be), but I clearly had not. This topic
surfaces rather regularly in the Twitter circles I pay attention to. Given that
my path has been anything but ideal, or ordinary, I think it is worth relating
here.

## The Beginning

In my view, my career started with my position as a technical support consultant
at [Clayton State University](https://clayton.edu). That's because I was doing
tech support there for _many_ years. I started in 1999, and left the position in
2008 when I graduated.

That's right, I was in university all that time as a student; indeed, I started
university in the autumn of 1998. I was not ready for university when I started,
and had to scale way back in order to focus on the core curriculum and succeed.
After one semester, my GPA was 2.0; by graduation, it was 2.92. I _almost_ got
it back above 3.0 with many consecutive ≥3.0 semesters. I relate the story of my
academic struggle/perseverance as proof that my path has not been ideal. Also,
to show that even such an abysmal start can be overcome with hard work.

Throughout the whole time I was pushing through university, I was either
frontline technical support or a "student assistant" in the networking
department ("backend" technical support). Being at a small "community"
university meant that people who showed initative to solve problems were allowed
to do so. While in the frontline position I wrote webapps to things like
scheduling support appointments and tracking who used what tools and how often
those tools were used (by writing a site that required authorization and tracked
downloads). I also experimented with various Linux distributions, ultimately
running Linux as my fulltime desktop operating system. Which is what led to the
next step in my career.

## Going Full Time

As I mentioned, I graduated in 2008. This meant two things: first, I could no
longer be employed as a student worker; and second, there were no jobs to be had
in the [Great Recession](https://en.wikipedia.org/wiki/Great_Recession). But I
had developed a reputation in the Office of Information and Technology Services
(OITS), the department I worked in as a student work, as fairly decent
developer. Thus, when the director of the student information services
subdepartment opened a role for a .Net developer, he called me, interviewed me,
and ultimately hired me.

I failed pretty hard in the .Net role. It was an unfamiliar framework for me,
and to this day I maintain that it was never designed to be a web application
framework (the request model is just _wrong_). But one of my coworkers, who was
administering the campus's student web portal, [took a new position][mrfrosti],
leaving a different role open that I was able to fill. This role was
techinically an application administrator role for a proprietary web portal
product, but it grew into a niche Linux administrator role. Originally the
product was only certified on Solaris, but the next release, that we had to
upgrade to right as I transitioned into the role, required Red Hat Enterprise
Linux (RHEL).

[mrfrosti]:
https://web.archive.org/web/20210128154051/https://mrfrosti.com/2010/03/09/last-week-at-clayton-state/

## Linux Admin? Web Developer? Both?

Over time, the semi-product slash Linux admin role required more and more actual
Linux administration. Specifically, other products we used from the same company
required RHEL. And since those products were to be administered by the
subdepartment I was in, I got to administer them from the operating system up.
It went this way for a couple of years until the director who hired me left,
along with the director of the "networking" department. The networking director
(really, "telecom") came to me and asked which deparment I thought _actually_
fit my role. My answer: his.

This is where I transitioned to a full time Linux administrator for all of the
Linux based business systems operated by the university. I really shined in the
Linux administrator role. By the time I left, I had all of those systems
bootstrappable from nothing to ready for the target application in a matter of
minutes through use of [iPXE](https://ipxe.org), Red Hat Satellite, and
[Ansible](https://en.wikipedia.org/wiki/Ansible_(software)). And I had to stand
up a _lot_ of systems.

But I retained the administratorship of that student web portal. Eventually, the
version we were using was end-of-lifed and we had to come up with a solution to
replace it. The product was utter garbage, the only thing our students ever used
within it was single sign-on to other products, and that didn't actually work
without _my own code to fix it_. So I proposed we write our own portal. Given
that I knew all of the requirements, and implemented the only feature we used, I
was granted permission to develop the new portal on my own. Reaally, it was
meant to be a collaboration between me and [another
coworker](https://caseyscarborough.com), but he left right at the start of the
project. Since it ended up being just me on the project, it ended up taking
about a year to complete. I wrote a full-fledged "portal"/CMS product, along
with an account management tool, and a [CAS
implementation](https://github.com/jscas). All while _primarily_ being the
campus's Linux system administrator.

One of the first things I knew I would need in the web portal project would be a
good logger. Prior to my collaborator leaving, we were going to write the portal
in Java and Spring. This meant I would have had access to
[slf4j](http://www.slf4j.org). But since I was now on my own, I knew I had to
change the language and framework. Java and Spring were too heavy for one person
to write something of this scope. So I decided to give Node.js another shot; I
had used it in the 0.x days and found it too volatile for a production project,
but Io.js had just merged back into Node.js as version 4.0.0, along with a brand
new long term support policy. So, I went looking for a logger. None of the
popular Node.js loggers would work because it was _obvious_ they would be
bottlenecks to the application. I despaired, thinking I would have to write my
own, but after digging through several pages of NPM search results, I came
across [Pino](https://github.com/pinojs/pino).

Pino was perfect. It did _exactly_ what I was planning to do in my own logger,
except better. It got out of the way of the event loop as much as feasibly
possible, and provided the familiar Log4j interface. The work I was doing led to
me contributing back to the project. This ultimately led to the story related in
[My Fastify Story]({{< ref "fastify.md" >}}); which is part of _this_ story, but
I will not re-hash it here. The short of it is that it led to me becoming a
maintainer of both Pino and [Fastify](https://github.com/fastify/fastify).

## Moving On To Knock.com

On January 4, 2015 I told a friend to come over to my house so we could work
together to write resume sites for ourselves. He wanted to be become a full time
designer and I wanted to become a full time software engineer. For me, that
ended up being [james.sumners.info][resume] ([first
commit](https://github.com/jsumners/jsumners.github.io/commit/1fb6697a4d21584948293cf01620eadcb83bbbd9)).
This decision would prove to the a pivotal decision my life: it's the one that
led to me actually landing a software engineering role that I could excel at,
and I do believe I have.

On January 30, 2018 I was laying on my couch watching television when I received
a text message I'll never forget:

> Hi James, I am Karan. One of the cofounders of knock.com - loved a few of your
> repos. I hope you are seeking opportunity, if you are, would love 5 mins of
> your time.

He had discovered my work through researching backend Node.js frameworks. Which
translates to:

1. Reviewing the Fastify and Pino projects.
2. Reviewing the major contributors and their profiles.
3. Landing on [james.sumners.info][resume].
4. Using the phone number on that page to send me a text.

On May 1, 2018 I started my new career as a software engineer. Today, my
position is "senior software engineer".

[resume]: https://james.sumners.info

## Summary

Going back the Twitter message that spawned this lengthy post: it's possible to
start a new career by contributing to open source projects. I have done it. The
way I see it, it requires:

Picking the right project, or set of projects, to contribute to. You are
unlikely to succeed in this venture if you start a project of your own, or pick
some obscure project only the author and _maybe_ two other people use. At the
same time, the project(s) you pick shouldn't be so big that your contributions
get lost in the noise. You _must_ be interested in the projects, as it will show
through in your work and your long term commitment. You could pick some big
project like React, but you'll have to work extra hard to gain recognition. Pino
and Fastify are still excellent candidates (as of this writing). My general
recommendation for helping decide is to look for projects that are still rather
nascent, but are being championed by well known individuals at conferences. They
are giving talks about those projects specifically to drum up interest and
acquire a contributor pool.

Once you decide on the project(s), start small by triaging issues. This could be
asking questions of the issue reporters to get clarification and writing a
reproduction case, or [submitting pull requests]({{< ref "git-collab.md" >}}) to
solve the issues. If you show respect for the project maintainers, accept their
feedback as helpful and not a comment on your ability, and show you're there for
the long haul, your work will be recognized.

All of this isn't to say that my path is typical. It isn't. I was _extremly
lucky_ that the right person recognized my work and reached out. This is highly
unlikely to happen without your own prodding. If you're trying to switch
careers, or even just start out a career, by contributing to open source, you'll
very likely need to start actively presenting your work to potential employers.
Just know that it is a viable route that can succeed with enough effort on your
part.

