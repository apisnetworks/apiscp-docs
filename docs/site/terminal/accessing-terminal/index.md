---
title: "Accessing terminal"
date: "2014-11-03"
---

## Overview

Your terminal is a command-line interface to your hosting account on the server. It provides a quick, efficient means to make permission changes, edit files, and even run services like MongoDB and node.js. Terminal access is provided with certain [qualified packages](https://kb.apnscp.com/terminal/is-terminal-access-available/).

## Logging In

Terminal access follows general login guidelines:

- Login consists of <username>@<domain>
    - Alternatively, <username>#<domain> is supported
- Password is your control panel password
- Hostname is just your domain name
    - If domain name has expired, use your [server name](https://kb.apnscp.com/platform/what-is-my-server-name/)

### Example

Assume your **username** is myadmin, **domain** example.com. To login using the [ssh](http://apnscp.com/linux-man/man1/ssh.1.html) program, the format would be ssh _<login>_@_<host>_ or `ssh myadmin#example.com@example.com`. `ssh myadmin@example.com@example.com` would also work for newer ssh clients that properly interpret the command-line string. _<username>_#_<domain>_ is used instead for illustrative purposes.

### Access in the control panel

Terminal access may also be accessed directly within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) under **Dev** > **Terminal**. Your login will be automatically filled-in. Just confirm with your password.

\[caption id="attachment\_397" align="alignnone" width="300"\][![Terminal interface available within the control panel.](https://kb.apnscp.com/wp-content/uploads/2014/11/terminal-ex-300x174.png)](https://kb.apnscp.com/wp-content/uploads/2014/11/terminal-ex.png) Terminal interface available within the control panel.\[/caption\]

### Caveats

Logging in using the ssh command via Linux or OS X can be confusing! Typical login syntax is `ssh login@domain`. This is incorrectly applied as _user@domain_ whereas it should be _user@domain@domain_. With a username "myuser" and domain "example.com", the appropriate SSH login would be, via the ssh command, would be `myuser@example.com@example.com`.

## Tutorials

Not everyone pops out of their mother's womb a master at using terminal. In fact, no one has; we all learned! There are several helpful tutorials to teach you the ropes of using the terminal:

- [Linux Journey](https://linuxjourney.com/) (linuxjourney.com)
- [Command line Crash Course](http://cli.learncodethehardway.org/book/) (learncodethehardway.org)
- [Linux Command Line](http://code.snipcademy.com/tutorials/linux-command-line) (snipacademy.com)
- [Bash Hackers Wiki](http://wiki.bash-hackers.org/) (bash-hackers.org)
