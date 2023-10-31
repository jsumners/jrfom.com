---
title: Thoughts On JavaScript Classes
date: 2023-10-32T11:45:00-04:00
lastmod: 2023-10-31T11:45:00-04:00
slug: js-classes
---

Lately, the topic of JavaScript classes has come up in some open source
projects I participate in. In short, a contributor wants to convert existing
prototype defined code to class defined code. I have mostly stayed out of the
conversation as my primary position is one of the ["old man yells at cloud"][cloud]
variety. But the primary counter argument is that "classes are easier to
maintain," and I'd like to address that in this article.

## Background

It should be well known by now that [es2015 introduced the `class` syntax][es2015]
to JavaScript. I don't want to rehash everything here, but for the context of
this article, we will mainly concern ourselves with the difference between:

```js
// A prototype defined object ("class").
function Person (name) {
  if (!new.target) return new Person(...arguments)
  this._name = name
}

Person.prototype.sayName = function (stream = process.stdout) {
  stream.write(this._name + '\n')
}
```

And:

```js
// An es2015 class defined object.
class Person {
  #name

  constructor (name) {
    this.#name = name
  }

  sayName (stream = process.stdout) {
    stream.write(this.#name + '\n')
  }
}
```

{{< aside >}}
For a full, up-to-date, discussion on what is available with the `class` syntax,
see [JavaScript Classes][mdn-classes].

[mdn-classes]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
{{< /aside >}}

Notice that in the prototype based instance we are utilizing a convention for
"private" fields, prefixing the field name with an underscore, and in the class
based instance we are utilizing language defined syntax for the private field.

### A Peek Behind The Curtain

The line is getting fuzzier with each improvement to the class syntax, but we
can still see hints that the syntax is [sugar][sugar] on top of the prototype.
Consider this alternate implementation of the `Person` class:

```js
class Person {
  name

  constructor (name) {
    this.name = name
  }
}

Person.prototype.sayName = function (stream = process.stdout) {
  stream.write(this.name + '\n')
}
```

So we are able to define the class with a minimum amount of code in the
`class` block, and extend it by adding to the prototype. Thus showing that
the class is still a prototype based object after the syntax is interpreted.

## Which Is More Maintainable?

I think the context matters when considering this question. When I started
working on the [v3.0.0 release of ldapjs][v3ldap] I opted to rework the
prototype defined objects into class defined objects:

1. So that I could get familiar with the syntax.
1. It made sense considering the way the code was structured.
1. I wanted new contributors to be able to follow the code.

I quickly encountered an issue that continues to frustrate me with the class
syntax: objects defined in this way really should have _all_ of the associated
code written within the `class {}` block. First, that's what makes it legible
to programmers who are only familiar with class defined objects. And second,
not all code _can_ be defined by extending the prototype.

Look closely at the two class defined objects in this article. In the first,
we defined the `name` field as a private field, and in the second as a public
field. Let's try combining the two:

```js
class Person {
  #name

  constructor (name) {
    this.#name = name
  }
}

Person.prototype.sayName = function (stream = process.stdout) {
  stream.write(this.#name + '\n')
}
```

When we try to include that definition in a script we will get a syntax error:

```
SyntaxError: Private field '#name' must be declared in an enclosing class
```

In short, we lose access to private fields and methods when we try to extend
a class through its prototype. So, if we have an object of any siginificant
complexity, we cannot use this "trick" to break up our code into multiple
scripts that would be easier to read and maintain unless we make all members
of the object public. Instead, we end up with a very large file that is, at
least to me, difficult to follow and find focus in. As example, see the
[base filter class][ldap-filter] that ended up in `ldapjs@3`.

If we want to retain the "private" nature of members along with being able to
organize our code into self-contained concerns, we can alter our prototype
defined object like so:

```js
const symName = Symbol('nameField')

function Person (name) {
  if (!new.target) return new Person(...arguments)
  this[symName] = name
}

Person.prototype.sayName = function (stream = process.stdout) {
  stream.write(this[symName] + '\n')
}
```

We need to provide access to our symbols in any files we break code out into,
but we retain our organizational flexibity along with strong hints to others
to keep away from the internals.


## Conclusion

I understand that more and more people are learning JavaScript from the
perspective of solely using the class syntax, and that using it makes it easier
for them to understand the code. But I think that code organization is an
important factor in "maintainability." I find that having to scroll up and down
to remind myself of relevant sibling code is more difficult than having the
two pieces opened side-by-side via different files. And I get just as lost
as scrolling when trying to have the same file open in two panes while
positioned to two different locations.

Ultimately, I think it's probably best to write new code with class defined
objects specifically to have the widest reach for contributors. But I'm
not quite convinced it is such a big win that all code needs to be converted.
It'd be easier for me to accept that outcome if we had the ability to
organize the code as described. I'm not sure I really like the way [Golang][go]
organizes packages, but it's quite similar to what I've described here for
prototype defined objects. Maybe there's a way to "fix" the private member
access from non-block defined members in a future version of the language?

[cloud]: https://knowyourmeme.com/memes/old-man-yells-at-cloud
[es2015]: https://web.archive.org/web/20230904145913/https://exploringjs.com/es6/ch_core-features.html#sec_from-constr-to-class
[sugar]: https://en.wikipedia.org/wiki/Syntactic_sugar
[v3ldap]: https://github.com/ldapjs/node-ldapjs/releases/tag/v3.0.0
[ldap-filter]: https://github.com/ldapjs/filter/blob/2f5fd6be88b26278536e18d02c4d6a3a4bb7425b/lib/filter-string.js
[go]: https://go.dev/ref/spec#Source_file_organization
