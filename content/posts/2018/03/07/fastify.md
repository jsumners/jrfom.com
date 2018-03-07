---
title: My Fastify Story
date: 2018-03-07T10:40:00-05:00
slug: fastify-story
---

On 02 May 2016 I submitted my [first pull request][pino-first-pr] (PR) to the
[Pino][pino] logging library project. Subsequent PRs eventually led to me being
offered a contributorship to the Pino project. Since then I have come to consider
the inventors of Pino, [David Mark Clements][dmc] and [Matteo Collina][mc],
to be friends. Additionally, I follow their open source work since they are
extremely smart individuals and produce some fantastic projects. This all led
me to [Fastify][fastify].

In January of 2017 I noticed Matteo contributing to a project named Fastify.
It was an intriguing name, so I investigated it. What I found was a fledgling
HTTP framework. At the time, I was a big proponent of [Hapi][hapi], a well
established HTTP framework. I had chosen Hapi over [Express][express] a few
years ago because there was too much boilerplate in starting up a basic
Express project. Express relies on plugins for everything, even the most basic
of things, whereas Hapi included a few things like form body parsing by default.
Also, I just liked the way Hapi's API worked over Express's and Hapi's
documentation was more comprehensive for newbies. So, I wasn't really looking
for a new HTTP framework. Thus, I fired off a simple PR to [fix a link][fixlink]
to Pino's documentation and idly paid attention to the project.

Over the next few months I started testing out Fastify in some small projects
at work. I simply needed to build some simple JSON only APIs and that's what
Fastify was designed to do. As I got into Fastify I started to really like it
and started contributing more patches to solve some issues I was having. As time
passed I was once again asked if I would like to join the team and I consented.

At this time I was already writing all of my new projects against Fastify, but
I had no inclination to convert old Hapi based projects to Fastify. I was
happy to continue using Hapi. Then Hapi announced a [major overhaul][overhaul]
of their framework. This was at least the second time Hapi had instituted
majorly breaking changes since I had starting using it, and this time the changes
turned Hapi into a completely new framework as far as I could tell. At this
point I dropped my support for Hapi and went all in with Fastify.

I had already been [pushing for Fastify v1.0.0][pushing] to be released, but
I picked up the pace at this point by requesting deadlines and more actively
traging PRs. I also started writing more plugins and patches in my free time.
As of 06 March 2018 Fastify v1.0.0 has been released and I can start releasing
things like [JSCAS][jscas] as production ready with Fastify as their base.

## What Makes Fastify Different?

Fastify takes inspiration from both Express and Hapi. One of the ways in which
Fastify is similar to Express is in the way it needs extra plugins to add in
basic functionality, e.g. [fastify-formbody][formbody]. But it also emulates
Hapi's core routing API with its [route method][route-method]; and this was
a bigger factor in using Hapi of Express, to be honest. So -1 and +1 and no
winner between the two to make Fastify a more attractive option.

No, the *real* reason to use Fastify is its "killer features": encapsulation
and decorators. Everything in Fastify, even the routes, are [a plugin][plugins].
And each plugin is provided *its own instance* of Fastify to work with. This
makes it possible to write very well defined code that is easily testable.

Let's consider an example. Suppose you want to have an unauthenticated welcome
page on the route `/` and an authenticated user page on `/info`. We could write
the following:

```js
const fastify = require('fastify')()

function slashPlugin (fastify, options, next) {
  fastify.get('/', function (request, reply) {
    reply.type('text/html').send('<h1>Welcome</h1>')
  })
}

function infoPlugin (fastify, options, next) {
  fastify.register(require('fastify-bearer-auth'), {
    keys: new Set(['123456'])
  })

  fastify.get('/info', function (request, reply) {
    // default type: application/json
    reply.send({
      username: 'foo',
      phone: '555-555-5555'
    })
  })
}

fastify
  .register(slashPlugin)
  .register(infoPlugin)
  .listen(3000, (err) => {
    if (err) throw err
  })
```

1. `slashPlugin` and `infoPlugin` could easily be written in separate files.
2. `slashPlugin` and `infoPlugin` do not have any *direct* dependency on
Fastify itself. Each of these plugins can be tested without ever installing
the Fastify library.
3. `/` has absolutely no knowledge of the `fastify-bearer-auth` plugin and
that plugin will not have any impact on the `/` route.
4. `/info` will be guarded by the `fastify-bearer-auth` plugin by virtue
of the fact that the plugin is registered within its encapsulation context.

So that's the encapsulation feature in a nutshell. But what about decorators?
Let's assume we need to pull the user information from a MongoDB database and
extend the example:

```js
const fastify = require('fastify')()

function slashPlugin (fastify, options, next) {
  fastify.get('/', function (request, reply) {
    reply.type('text/html').send('<h1>Welcome</h1>')
  })
}

function infoPlugin (fastify, options, next) {
  fastify.register(require('fastify-bearer-auth'), {
    keys: new Set(['123456'])
  })

  fastify.get('/info', async function (request, reply) {
    const db = fastify.mongo.db
    const users = await db.collection('users')
    reply.send(
      await users.findOne({username: 'foo'})
    )
  })
}

fastify
  .register(require('fastify-mongodb'), {url: 'mongodb://localhost/foo'})
  .register(slashPlugin)
  .register(infoPlugin)
  .listen(3000, (err) => {
    if (err) throw err
  })
```

Notice that we registered `fastify-mongodb` on the root instance of Fastify.
By virtue of [fastify-plugin][fastify-plugin], which `fastify-mongodb` uses,
we are able to access the `mongo` decorator that the plugin adds within any
plugin registered within the same context. Since `slashPlugin` and `infoPlugin`
are also registered to the root Fastify context, the `mongo` decorator is
available to them.

Hopefully you can see how powerful the combination of decorators and
encapsulation are. They radically changed how I develop JSCAS, for the better.
As an example, the plugin API in JSCAS has been completely redesigned and
[implemented][jscas-api] via these Fastify features. I think you'll find them
as awesome as I do if you start using them.

## Fin

I am very happy to have been a part of getting Fastify v1.0.0 ready for release.
I think it has the potential to radically impact the way HTTP servers are
written in Node.js. It's *fast* and introduces concepts that greatly simplifies
code and promotes modularity. I look forward to seeing the community and project
grow.

[pino-first-pr]: https://github.com/pinojs/pino/commit/3a6ae328a9a47538608180574149dad57b4bd4ae
[pino]: https://getpino.io/
[dmc]: https://twitter.com/davidmarkclem
[mc]: https://twitter.com/matteocollina
[fastify]: https://fastify.io/
[hapi]: https://hapijs.com/
[express]: https://expressjs.com/
[fixlink]: https://github.com/fastify/fastify/commit/d3c62668226fd4e78abb24a9e8c15d92fe467223
[overhaul]: https://github.com/hapijs/hapi/issues/3658
[pushing]: https://github.com/fastify/fastify/issues/229
[jscas]: https://github.com/jscas
[formbody]: https://npm.im/fastify-formbody
[route-method]: https://www.fastify.io/docs/latest/Routes/
[plugins]: https://www.fastify.io/docs/latest/Plugins/
[fastify-plugin]: https://npm.im/fastify-plugin
[jscas-api]: https://github.com/jscas/cas-server/blob/261099ce78bc7f51e6f9298b3301ec9cc525efb0/lib/plugins/pluginApiPlugin.js
