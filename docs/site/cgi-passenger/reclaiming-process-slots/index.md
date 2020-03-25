---
title: "Reclaiming process slots"
date: "2015-03-03"
---

## Overview

When trying to redeploy a Passenger process, Passenger may refuse deployment, because you have maxed out on available process slots. Terminating the process will free a connection slot and permit Passenger to launch a new process.

## Symptoms

Upon launching an application after [restarting](https://kb.apnscp.com/ruby/restarting-passenger-processes/), the app will hang and [log an error](https://kb.apnscp.com/cgi-passenger/viewing-launcher-errors/) similar to:

\[ 2015-03-03 14:36:46.2725 11560/7f728e250700 Pool2/Group.h:898 \]: Unable to spawn the the sole process for group /home/virtual/siteXXX/fst/var/subdomain/SUBDOMAIN/../../www/APPNAME#default because the max pool size has been reached. Trying to shutdown another idle process to free capacity...

## Solution

Kill any resident processes from the [terminal](https://kb.apnscp.com/terminal/accessing-terminal/). You can accomplish this in one of two ways:

### Easy way

Know the process name? `kill -9 $(ps -o pid= -C PROCNAME) - `substitute _PROCNAME_ for the process name

Example: to kill all Python processes running with the binary, _python_: `kill -9 $(ps -o pid= -C python)`

In certain situations, a kill may be issued to other processes. This won't affect neighboring processes, but will elicit a warning that may be safely ignored:

bash: kill: (17267) - Operation not permitted
bash: kill: (17413) - Operation not permitted

### Hard way

Don't know the process name? Use [ps](http://apnscp.com/linux-man/man1/ps.1.html) to pull up processes:

Example:

\[sand@sol www\]$ ps x
 PID TTY STAT TIME COMMAND
 1898 ? Sl 0:02 Passenger AppPreloader: /home/virtual/site137/fst/var/www/rails4
 3512 ? Sl 0:00 Passenger MeteorApp (3519)
 3827 ? S 0:00 python /.socket/passenger/helper-scripts/wsgi-loader.py

_This is an abridged process list_

Inspect the value under the _PID_ column. PIDs are process identifiers and are a globally unique way to identify a process running. Take the PID for the respective Passenger application, then [kill](http://apnscp.com/linux-man/man1/kill.1.html) it.

kill -9 1898

This will kill the application running under `/var/www/rails4` allowing Passenger to spawn a new instance.
