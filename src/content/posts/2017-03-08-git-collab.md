---
title: A Primer On Contributing To Projects With Git
date: 2017-03-08T14:10-05:00
---

There isn't any shortage of tutorials on this subject, but I haven't seen any
that attempt to guide a person that has zero experience with any of it. So,
the goal of this article is to give a fresh "newbie" all of the information
they need to collaborate on projects that use the [Git SCM][git]. This will not
be a complete, or even a full introductory, guide to *git*; you should read
other tutorials, and the [reference docs][refdocs] for that.

[git]: https://git-scm.com/
[refdocs]: https://git-scm.com/docs

<a id="setup"></a>
## Setup

We will focus on using the command line interface. Thus, to start, we need
to setup the environment.

<a id="windows"></a>
### Windows

I am not a Windows person. My day job is a Linux administrator and my full-time
desktop environment is Appple macOS. Given that, the easiest environment I have
found for Windows is to:

1. Install [msysgit](https://git-for-windows.github.io/)
2. Install [ConEmu](https://conemu.github.io/)
3. Configure the default "task" for ConEmu to the one that uses the Bash
   shell provided by msysgit

<a id="linux"></a>
### Linux

This will vary based on the distribution you use. The short of it is that you
need to install their package that provides *git*; typically, the name of the
package is simply "git".

If you are using [Void Linux](https://voidlinux.eu) (my preference), then I
recommend installing both the "git" and "git-perl" packages.

<a id="macos"></a>
### macOS

I prefer using the "git" package from [MacPorts](https://www.macports.org/).
But the easiest way to get started is to simply open a Terminal.app session
and execute `git`:

```sh
$ git
$ # you will be prompted to install the necessary components
```

Speaking of Terminal.app, I recommend switching to [iTerm2](http://iterm2.com/).
It's just better.

### Config

With *git* installed, you should now configure it to know some details about
you. These details will be used to identify you on the changes that you
make within a project:

```sh
$ git config --global user.name 'FirstName Surname'
$ git config --global user.email 'your.email@example.com'
```

<a id="authentication"></a>
### Authentication

We will discuss central repositories shortly, but regardless of how the project
you wish to contribute to chooses to centralize, you will need to authenticate
yourself when synchronizing your contributions. You have two options:

1. Communicate with the central repositories over HTTPS
2. Communicate with the central repositories over SSH

In case #1, you will be prompted for your user credentials each time you
work with the remote system. You can minimize this by using a "credential helper."
A nice overview of getting such a helper setup is available at
[http://stackoverflow.com/a/5343146/7979](http://stackoverflow.com/a/5343146/7979).

As for case #2, you will need to create an SSH key pair for yourself and configure
the remote system to recognize it. Given the complexity of this method, we will
assume the first method is being used. If you want to learn about the SSH method,
then I am sure whichever central system your project uses will have instructions
that will help you out.

<a id="collaboration"></a>
## Collaboration

Now that we have a working *git* environment, we can learn about how to actually
use it to collaborate on a project.


<a id="account-setup"></a>
### Account Setup

Whether you are working solely within an institution or you are participating
in an open source project, you will be working with a central repository.
There are many ways a repository can be hosted centrally, but the most common,
and the ones we will assume in this article, are provided by the
following services:

1. [GitHub](https://github.com)
2. [GitLab](https://gitlab.com)
3. [Bitbucket](https://bitbucket.org)

All three offer some form of on-premises solution, public hosted repositories,
and private hosted repositories. Regardless of the service provider and its
location, you will need an account with the service. Thus, the easiest step
is the first -- create an account.

For the rest of this article we will assume you created a GitHub account at
[github.com](https://github.com).

<a id="git-and-github"></a>
### Git And GitHub

*git* is a distributed source code management tool. This means that *git* is
intended to be used locally, *without* a central server. But all of the sites
outlined in [account setup](#account-setup) are centralized server. So we need
to think of sites like GitHub as a system that many people have "local" accounts
on where they store their *git* repositories. This allows the users to make their
repositories available to other users of the GitHub system, such that those
users can create their own copy of other users's repositories. In turn, this
allows GitHub to provide features on top of the standard *git* features.

As a brief overview of the remainder of this article, the workflow created
by this setup is as follows:

1. Bob creates a *git* repository on his local machine.
2. Bob copies it to his GitHub account, thus making the real respository the
   one hosted on the GitHub system.
3. Alice decides she likes Bob's project and wants to help him with it, so she
   "forks" (copies) the repository to her own GitHub account.
4. Alice "clones" her copy of the repository on the GitHub system to her local
   computer.
5. Alice tells her local repository about Bob's "upstream" (original)
   repository so that she can stay up-to-date with Bob's changes.
6. Alice creates a "branch" on her local repository, makes changes, and "pushes"
   those changes to her fork on the GitHub system.
7. Alice uses the GitHub interface to tell Bob about her changes, asking if he'd
   like to incorprate them into his original repository.
8. Bob decides he likes the changes, accepts them, and his repository on the
   the GitHub system is updated.

<a id="forking"></a>
### Fork The Project

For remainder of this article we will assume that you want to collaborate on the
awesome [Pino](https://github.com/pinojs/pino) project. Our first step is to
create a copy of the project in our account on GitHub. So we navigate to
[https://github.com/pinojs/pino] in a web browser and click "Fork" button
(currently in the upper right corner of the page). GitHub will then show a
screen that the process is happening, and then load the Pino repository
in your account.

<a id="cloning"></a>
### Cloning

Now that Pino has been forked to your account, we will "clone" it to your
local machine. Cloning, in this context, is merely copying the repository
from your GitHub account to your personal computer. To accomplish this task,
we use our terminal and enter:

```sh
$ cd ~/Projects # or any place you want to keep a collection of projects
$ git clone https://github.com/your-username/pino.git
```

At this point you will have a directory: `~/Projects/pino`. This directory
is your local copy of the repository. This local copy is automatically tied to
your copy of the repository on the GitHub system. This link between your two
copies is known locally by the name "origin". Within *git* this is known as
a "remote". To see the remotes associated with your local repository, which,
at this point, is only "origin", issue the commands:

```sh
$ cd ~/Projects/pino
$ git remote
```

For more information on remotes, read
[https://git-scm.com/docs/git-remote](https://git-scm.com/docs/git-remote).

<a id="upstream"></a>
### Link To Upstream

Before you begin working on your changes it is a good idea to connect your
local repository to the original repository. Colloquially, this is known
as the "upstream" remote. From within your local repository, issue the
following command:

```sh
$ git remote add upstream https://github.com/pinojs/pino.git
```

<a id="branching"></a>
### Create A Feature Branch

We are now ready to begin working on some changes to the project. The key to
successful collaboration is to request the minimal amount of changes as is
necessary to implement your idea (or fix). You should do this on a new branch
within your repository. A branch is merely a snapshot of the repository at a
specific point in time. By working on a branch you lock the project to the
state at which you decided you want to add changes, and it makes it easier
for the upstream project owners to review your changes when you submit them.

Typically, you will want to name your branch in such a way that it indicates
why the branch was created. So, let's assume we want to make some documentation
corrections. Enter the following command from within your local copy of the
repository:

```sh
$ git checkout -b doc-corrections
```

The above command is a shortcut for the following two commands:

```sh
$ git branch doc-corrections
$ git checkout doc-corrections
```

Every repository has what is known as a `master` branch. At this point, we
have started a new branch, `doc-corrections` from the current state of the
`master` branch. To see the branches available:

```sh
$ git branch
```

Before moving on, let's also create the `doc-corrections` branch within your
copy of the repository on GitHub. To do this, we will "push" our branch:

```sh
$ git push -u origin doc-corrections
```

This has done two things:

1. It has created the `doc-corrections` branch in your repository on GitHub.
2. It has configured your local copy of the repository to know that the local
   `doc-corrections` corresponds to the `doc-corrections` in your GitHub copy
   of the repository. This allows for some shortcuts when issuing certain
   *git* commands.

To learn more about branching and pushing, see:

+ [https://git-scm.com/docs/git-branch](https://git-scm.com/docs/git-branch)
+ [https://git-scm.com/docs/git-push](https://git-scm.com/docs/git-push)

### Making Changes

Now that we are on our own branch we can make our changes. For now, let's
pretend you have made some typo corrections to the `README.md` file. Which is
to say, you have opened `README.md` in your text editor, adjusted the text
within and saved the document. If you issue the following command:

```sh
$ git status
```

You will see that *git* has recognized that you made changes to the file. At
this point *git* isn't going to do anything with those changes. Files that
are tracked by a *git* repository have two stages: modified and scheduled
to be committed. In the "modified" state *git* merely recognizes that a file
has been changed from its initial state. In the "scheduled to be committed"
state *git* will write the changes made to the file into its internal tracking
when the `git commit` command is run. So, let's move our changes from the
modified state to the schedule state:

```sh
$ git add README.md
```

With the changes scheduled to be committed, let's actually perform the commit:

```sh
$ git commit -m 'A short summary of the changes'
```

The above is the equivalent of sending an email with nothing more than the
subject line filled in. To write a full commit message, simply issue
`git commit`. This will open the default commit editor, probably a variant
of `vi`. A full commit message should have the following format:

```
A short summary of the changes

A body describing in further detail your changes.
The summary line should not exceed 40 to 50 characters, and the body
lines should not exceed 80 characters. Thes are not hard and fast
rules, per se, but they widely followed guidelines.
Some projects have other requirements for commit messages, and
may refuse changes if they are not followed.
```

With your changes committed to the local repository, it's time to send them
to your copy on GitHub:

```sh
$ git push
```

We are able to use this short push command since we linked your local
`doc-corrections` branch to your remote `doc-corrections` branch. If we hadn't,
you'd have to issue:

```sh
$ git push origin doc-corrections
```

You can learn more about committing at
[https://git-scm.com/docs/git-commit](https://git-scm.com/docs/git-commit).

### Incorporating Upstream Changes

Prior to sending our corrections to the upstream project, it's a good idea
to make sure you have any changes that have occurred upstream into your
repository. To do that, we need to switch to the `master` branch, pull in
changes from upstream, and then merge them into your `doc-corrections`
branch:

```sh
$ git checkout master
$ git pull upstream master
$ git checkout doc-corrections
$ git merge master
```

At this point *git* may tell you that there are conflicts. A conflict arises
when the same file has been edited in both branches of the merge,
`master` and `doc-corrections` in this case, such that *git* can't decide
which change should "win." If this happens you will need to fix the conflicts
and then issue a `git commit`.

With all of the changes incorporated, it's time to push them to your copy
on GitHub: `git push`.

You can learn more about resolving conflicts at
[https://githowto.com/resolving_conflicts](https://githowto.com/resolving_conflicts).

### Sending Your Changes To Upstream

Now that your changes are pushed to your copy of the repository on GitHub, it's
time to send them to the upstream repository owner(s) for review and possible
inclusion. To do this, open your copy of the repository on GitHub. It'll be at
a URL like `https://github.com/your-username/pino`.

With your repository open on GitHub in your browser, you should see a message
suggesting that you send a "Pull Request" (PR) from your `doc-corrections`
branch to the upstream `master` branch. Simply click the button in that message
and you'll be taken to a form where you will can describe your PR. It will
default to the last commit message in your branch, but you can change it.
When you are happy with the PR message, submit the PR and wait.

GitHub is going to email the authors of the upstream project to let them know
about your PR. They will review it and probably start a discussion with you, or
just accept it if a discussion isn't necessary. Either way, you will receive
emails keeping you informed of the process.

Once the PR has been resolved, you can remove your feature branch:

```sh
$ git checkout master
$ git pull upstream master
$ git branch -D doc-corrections
```

## Summary

While it may seem like a complicated process, and in some ways it is, you should
now be able to collaborate on a project that uses the Git SCM. In general, this
is how most open source projects work. And once you have gone from fork to
PR, the process shortens to simply staying synchronized, creating branches, and
submitting PRs.

Don't be afraid to get involved. If the upstream people ask for changes, in most
cases they are not insinuating anything about you personally. The simply want
your changes to conform to the nature of their project so that your changes can
be included. Or they have suggestions for improvement, so that your changes can
be included.

A great place to get started with almost any project is with the documentation,
just as we did in this article. If there's one thing every project wants it's
someone willing to write documentation. As you get more comfortable, you will
certainly start branching out from there.

By the way, I'm a maintainer on the [Pino](https://github.com/pinojs/pino)
project. I look forward to seeing your PRs :)
