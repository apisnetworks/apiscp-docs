---
title: "Viewing launcher errors"
date: "2015-03-03"
---

## Overview

Applications launched by Passenger on [v6+](https://kb.apnscp.com/platform/determining-platform-version/) platforms may emit output on stdout or stderr channels. Any output emitted is logged to an aggregate log called `passenger.log` in `/var/log`.

**Important:** since these logs are combined among all accounts using Passenger, never output anything confidential to stdout or stderr when launched using Passenger. Once an application is up and running, use a logging facility to log messages. Do not use a `puts`/`print`/`console.log` construct that will emit to stdout.

### Sample output

App 24248 stdout: Migrations: Up to date at version 003
App 24248 stdout: Ghost is running... 
App 24248 stdout: Your blog is now available on http://my-ghost-blog.com 
App 24248 stdout: Ctrl+C to shut down
App 24248 stdout: 64.22.68.22 - - \[03/Mar/2015:20:10:12 +0000\] "GET / HTTP/1.1" 200 3551 "-" "curl/7.29.0"

This is sample output from [Ghost](https://kb.apnscp.com/guides/installing-ghost/), a Node.js application. All output occurred over stdout and is likewise logged. Running Ghost from the command-line, e.g. `node index.js` would emit the same output.
