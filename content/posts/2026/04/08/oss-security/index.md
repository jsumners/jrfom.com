---
title: Open Source & Security
date: 2026-04-08T07:00:00-04:00
lastmod: 2026-04-08T07:00:00-04:00
slug: oss-security
---

{{<image-center
  src="bsky-post.png"
  caption="LLMs creating issues"
  resizeParam="500x q80">}}
> There is a GitHub user (LLM?) that is reporting a lot of "security
> vulnerabilities" as open issues.
>
> They are mostly trash reports (e.g. "if you pass Object.prototype to the
> setFooOnObject function, it will set Object.prototype.foo so that's prototype
> pollution"), but what if one is real?

Spicy take up front: let the security vulnerabilities be legitimate and posted
out in the open for anyone to see.

-----

I have experienced [common vulnerabilities and exposures (CVEs)][cves] in at
least two capacities: in my previous life as a Linux system adminstrator and
as a maintainer of open source code. I think the whole system is a waste of
time.

As a sysadmin they are mostly just busy work. Someone will run a scan
with some CVE detection tool, send you a report of all the "vulnerabilities"
the tool found, and you then get to stop everything and update all "affected"
systems in whatever way is necessary to remediate the problem(s). Nigh on
100% of the time these reported vulnerabilities don't actually affect the
systems; it's just that the tool was able to match discoverable strings to its
database of indicators. There isn't any thought applied to generating these
reports. If you're lucky, you can mark them as not applicable; but that usually
ends up being more "red tape" work than the patching work would have been. It
doesn't matter that the moons of Saturn have to be in perfect alignment during
a solar storm for the vulnerabilities to have any effect. You still have to
justify marking them as not appicable, or devise a resolution strategy.

As a maintainer of open source code, in my experience, it's nothing more than
a game people are playing for some sort of clout/reward. Very, very, rarely do
people show up with a new vulnerability report with a remediation or are willing
to produce a remediation. Their sole goal is to get a CVE issued with their
"name" attached to it. To accomplish that goal, they leverage any ["responsible
disclosure"][rd] process put in place by project maintainers to force one of:

1. The project issuing a remediation with the CVE assigned and noted.
2. The publication of the CVE regardless of a remediation being availble.

To be clear: neither of these cases give any shits at all about the effect on
the maintainers of the code. Consider the [log4shell][l4s] situation:

> It all started a few hours earlier on a cold November day, when Christian, who
> is a maintainer of the open source project Log4j, planned to spend time playing
> games with his son. Instead, he found himself staring at his phone, watching
> notifications pile up in his inbox—10, then 20 emails flooding in. When he saw
> the words "remote code execution," his first thought was: "Maybe I’m on the
> wrong mailing list."
>
> He wasn’t. And within hours, Christian would be at the center of what became
> known as Log4Shell: the most severe vulnerability in internet history,
> affecting billions of devices from Fortune 500 companies to Minecraft servers
> worldwide.
>
> "I told my son, I will play with you in like five minutes," Christian
> recalls. "But he didn’t see me for the next couple of days."

Since then, the solution to this very real problem hasn't been one where the
people (companies; I'm referring to companies here) relying on all of this
open source software have stepped up to support the things they depend upon.
The typical "solution" is to create a program that effectively seeks donations
to forward on to the maintainers of projects willing to work with the
program. All solutions end up perpertuating the status quo. The world continues
to depend on open source code and continues to expect it to be delivered and 
maintained at the cost of those who dared to release it or participate in
developing it.

## It's Only Worse Now

The attempts at solving the funding/maintainer problem, to date, are founded
in a world in which we no longer live. As of late 2025, at the latest, people
are using [LLMs][llms] to "find" vulnerabilities and file them with projects.
This is what the opening Bluesky post is referring to.

In the old world, the literal human cost to discover and report these issues
served as a good speed bump to keep the workload somewhat manageable. But now
people are generating 10s and 100s of reports on projects without any thought
at all. The security researchers that care are now even fewer in number. It's
even more about getting as many clout points as you can. And the approach is to
blast every project you can find with automated reports so that they can sneak
past the few projects that are willing to do proper due diligence for every
report.

That's if the reports are being opened through a project's responsible
disclosure process. The latest trend is for someone to spawn a bot that will
trawl GitHub projects. These bots will look for "easy" open issues or
"discover vulnerabilities" in the code and open pull requests (PRs) for whatever
it can find. Almost every single one of the PRs is complete trash. But a
maintainer still has to triage them. Only now they also have to fend off
an army of bots they never asked for.

## Let The Vulnerabilities Be Free

To summarize this rambling rant: I vote we let the vulnerabilities be posted
in the open for anyone to see. It is clear to me that leeches of open source
have no intention to support the code they rely upon; but they will raise
hell all the way to the White House, and demand someone do something about it
(but not them! hell no!), the moment a vulnerability shows up in the things
they use. And the people who suddenly think they are l33t security researchers
because they can set the globe on fire with their statistical word generator
to find issues are out there flooding maintainers with garbage both privately
and publicly anyway.

None of these projects owe anyone anything. If there's a bug in it, so be it.
If it affects you: SOLVE THE BUG AND SUBMIT A FIX FOR IT. Otherwise, no one
publishes open code under a license with any guarantees of anything, much less
their personal time and effort simply because there's a bug in the code. If
anything, the licenses guarantee the code is probably broken.

Some may say that's the bargin you struck by releasing code for anyone to use.
I say I put code out to solve problems that _I_ had and think other people
may benefit from the solution. I don't put code out there for people to steal,
productize, and then demand more labor. Put another way: writing code is the
fun part, and that's what open source is for, to practice the fun part. If the
reports are out in the open, maybe there is a chance that people will learn
about them and step up to provide resolutions.

[cves]: https://en.wikipedia.org/wiki/Common_Vulnerabilities_and_Exposures
[rd]: https://en.wikipedia.org/wiki/Coordinated_vulnerability_disclosure
[l4s]: https://en.wikipedia.org/wiki/Log4Shell
[l4s.2]: https://web.archive.org/web/20260312003111/https://github.blog/open-source/inside-the-breach-that-broke-the-internet-the-untold-story-of-log4shell/
[llms]: https://en.wikipedia.org/wiki/Large_language_model