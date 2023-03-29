---
title: Soverin Plus SimpleLogin
date: 2023-03-29T10:30:00-04:00
lastmod: 2023-03-29T10:30:00-04:00
slug: soverin-plus-simplelogin
---

I used to run my own email server for several years before I switched over to using Gmail. It was nice having my own domain, but maintaining the server and dealing with flaky internet services eventually became too much. So I have been using Gmail as my primary email service since 2004-08-19. But in late August of 2019 I finally got tired of dealing with all of the advertisements in my inbox. I get a _lot_ of email, and dismissing advertisements before getting into dismissing all of the email is really tiresome.

Enter [Soverin.net](https://soverin.net).

## Soverin

Soverin is a traditional email provider that:

1. Uses TLS for receive and send by default
2. Supports IMAP
3. Supports custom domains
4. Provides an anonymous email address
5. Email address aliases
6. Supports server-side filtering
7. Supports configurable spam protection
8. Provides a usable webmail interface

For the most part, the service is just plain email and doesn't need any explanation. But there are a few features that I think deserve some dedicated discussion: the anonymous email address, server-side filtering, and email aliases.

Let's cover the server-side filtering first. This is a familiar feature from Gmail, and other webmail services. It allows you to define rules that incoming emails will be matched against. The matched emails will have some sort of action performed, e.g. moving the email to an IMAP "folder".  Maybe things have changed since I was running my own server, or I just didn't know enough 🤷‍♂️, but a little bit of research shows that servers like Exim support user and system filter files that provide this sort of functionality. But maintaining such files are yet another chore in maintaining the email server. Soverin provides a nice web interface that makes it easy.

Additionally, they support some filtering that doesn't require any configuration. Specifically, they have added filtering to plus addresses (subaddressing). For example, if your IMAP has a folder named **foo**, and your Soverin email address is `email@example.com`, then emails delivered to `email+foo@example.com` will be automatically delivered to that **foo** IMAP folder. This is a nice extension to the subaddressing popularized by Gmail.

Next is the very unique feature of an anonymous email address provided to each mailbox. This is an address that bears no visible relationship to your actual email address, but will deliver emails sent to it to your mailbox, and can be used to hide your information when sending emails. This was a pretty cool feature to discover upon signing up, because it isn't advertised anywhere on their site. It's really nice being able to hide your real details from some sketchy sites.

And finally, email address aliases are supported at the domain and mailbox levels. As an example, if `email@example.com` is your primary address, and you need to create a new account with some website named **megastore**. You can create an alias `megastore@example.com` and any emails sent to it will be delivered to the `email@example.com` mailbox. Additionally, every mailbox supports a catch-all option that can be set to either reject unrecognized emails or deliver them to the mailbox. Which means you can create arbitrary aliases any time without having to go to your Soverin dashboard: merely give out an alias-like address and it will be delivered accordingly by setting the catch-all to accept instead of reject.

## SimpleLogin

There is a problem with aliases and catch-all delivery, though: sending emails from an alias address is impossible without first adding that alias to your Soverin account through the dashboard. In other words, if `foo@example.com` is an alias added in the dashboard and `bar@example.com` is an alias managed through the catch-all feature, _**only**_ the `foo@example.com` address can be used to send outgoing emails. This makes it really cumbersome to manage aliases and keep your main details hidden. That is, the purpose, for me, in using email aliases is to hand out email address I can easily tie to companies and see who has decided to sell my information. But I still want to be able to communicate with these companies without exposing the address I was trying to hide in the first place.

This is where [SimpleLogin](https://simplelogin.io) (SL) comes in. Basically, SL takes the catch-all + alias feature and turns it into a usable product. SL will receive emails, rewrite the reply-to headers to point back to SL, and then deliver the email to an email address you have specified. Further, SL supports adding _outgoing_ aliases to an email address. And at any time, you can log in to your SL dashboard and disable an alias, thus stopping any emails sent to it from ever getting to your inbox. This is really powerful, and I have two examples to show it.

### Dealing With A Businesses

Mentioned above is the scenario where you need to give a business an email address, but you don't want to give out your _actual_ address. This is easy with SL. Assuming you have SL configured to recognize emails sent to the domain `example.net`, and the business name is `SketchyRUs`, you simply give the business the email address `sketchyrus@example.net` and their emails will be remapped and forwarded your primary address, e.g. `me@example.com`. Now, any email you get from `sketchyrus@example.net` can simply be replied to and it will go to the right people without your private address being revealed.

That's the basic case. Now let's assume you have encountered some situation where you need to initiate contact with the company. Maybe the product you bought from them is defective and you need to start a conversation with their support department and their email is `support@sketchrus.com`. First, login to your SL dashboard, find the `sketchyrus@example.net` address, click the "Contacts" button, and add a new "reverse-alias" for `support@sketchyrus.com`. This will create a new email address that you can copy and use in an outgoing email.

So let's say that SL generated `abc123def@simplelogin.co` as the reverse alias. When you send an email to this address, SL will rewrite all of the outgoing headers to look like they are coming from the SL service and your `sketchyrus@example.net` alias. When the support team responds, their email will go to SL, who will then rewrite the headers for that email and deliever it to your inbox.

And just like that, 💥, you get to hide your real email address while still being able to easily communicate with are remote service. This also solves another problem with Soverin native aliases: you don't have to configure your email client with a new profile in order to send emails from the alias. Now, all that is required is copying the outgoing reverse alias whenever you need it, or simply adding that reverse alias to your email client's address book.

A real-world example of how this setup is beneficial occurred for me in February. I had a coupon for an oil change at a car dealership that I had not dealt with before. When I made the appointment I used an email address like `car.dealership@example.com`. The appointment came and went. A few days later, I started getting emails from SiriusXM addressed to the email I gave the car dealership. I knew right away who had sold my information, and I was able to stop the emails without giving them _any_ interaction: I just logged in to SL and turned off that alias.

### Mailing List Subscriptions

Another great use case for SL is signing up for mailing lists. I have been a member of the [Atlanta Linux Enthusiasts](https://ale.org) (ALE) mailing list for a couple of decades. Like most public mailing lists of this nature, there is a public archive all of all the emails sent to it. These archived emails include the full sender details; that is, the email address you use to interact with the mailing list is not private.

Using SL, we can fix this problem. It's really the same thing as the previously discussed business scenario:

1. Sign-up to the mailing list with your alias, e.g. `ale@example.com` (where `example.com` is the domain you use for alias addresses)
2. Create a reverse alias via the SL dashboard
3. Add the reverse alias to your address book
4. Reply to emails from the mailing list without doing anything special, and start new threads by sending an email to the reverse alias stored in your address book 

There is one thing, however, that can set this scenario apart from the business scenario: Soverin's server-side filtering! All of the emails you get from the mailing list will have some sort of distinguishing feature that can be used to route those emails into a specific IMAP folder. In ALE case, the `From:` header will always have `ale@ale.org` in the value. So all we have to do is create a filter that inspect that header for that value and configure it to move those emails to a unique folder. We never have to configure anything in our email client for dealing with these emails 😀.

## Summary

Soverin in combination with SimpleLogin is a really powerful setup for managing your own email. You can rely one or both of their domains, or you can provide each with unique domains. You can setup a subdomain to give to SL for aliases, if you only want to deal with one [TLD](https://en.wikipedia.org/wiki/Top-level_domain). Personally, I have one TLD for Soverin and another `.com` that I use for my aliases. [DKIM](https://en.wikipedia.org/wiki/DomainKeys_Identified_Mail) and [SPF](https://en.wikipedia.org/wiki/Sender_Policy_Framework) is supported throughout.

I'd love to see Soverin integrate SL directly so that I can reduce my costs, but SL is quite affordable and the dashboard is very clean. It's a great service on its own, and will pair nicely with any email provider, including Gmail.

I highly recommend Soverin if you want a traditional email host with some nice extras. And I definitely recommend SimpleLogin to anyone that cares about keeping their inbox even a little bit private and manageable.