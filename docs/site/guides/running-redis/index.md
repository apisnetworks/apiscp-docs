---
title: "Running Redis"
date: "2015-01-13"
---

## Overview

[Redis](http://redis.io/) is an advanced key-value cache and store, similar to memcached with [better performance](http://redis.io/topics/benchmarks). It is available on [newer platforms](https://kb.apnscp.com/platform/determining-platform-version/) (v6+) without any [additional compilation](https://kb.apnscp.com/terminal/compiling-programs/) from source. Accounts [with terminal access](https://kb.apnscp.com/terminal/is-terminal-access-available/) are eligible to use Redis.

## Quickstart

From the [terminal](https://kb.apnscp.com/terminal/accessing-terminal/), run: `redis-server --bind 127.0.0.1 --port PORT` where PORT is a [preassigned port](https://kb.apnscp.com/terminal/listening-ports/) to the account.

**Note:** use 127.0.0.1 to prevent outside network activity. 127.0.0.1 will only allow traffic that originates from the same server. A better solution, if using CGI or a [Rails](https://kb.apnscp.com/ruby/setting-rails-passenger/) application, is to specify ---`unixsocket /tmp/redis.sock` instead of `--bind`/`--port` to specify a local UNIX domain socket instead of a TCP socket.

## Configuring & Daemonizing

Now with Redis up and running, you can create a long-term solution that starts up with the server and always runs in the background. Start with either the [stock configuration](http://download.redis.io/redis-stable/redis.conf) or just copy and paste, making sure to update the `port` parameter to a [port assigned](https://kb.apnscp.com/terminal/listening-ports/) to your account.

> **Note**: as with most configuration files, any line that begins with a octothorpe/pound/hash symbol (#) denotes a comment. These are never interpreted by an application, but serve as guidance. The following configuration omits these helpful comments for brevity.

Copy and paste the following content to a file named `redis.conf` in your home directory:

\# run as service
daemonize yes
pidfile ~/redis.pid
#########################################
# USE A PREALLOCATED PORT TO YOUR ACCOUNT
#########################################
port 123
# limit to local traffic only
bind 127.0.0.1
# To use a high performance local socket, uncomment
# these 2 lines and comment port/bind:
# unixsocket /tmp/redis.sock
# unixsocketperm 700
timeout 60 
tcp-keepalive 30
# Create a log file and log errors to redis.log
loglevel warning
logfile /tmp/redis.log
# Limit to 1000 concurrent clients
maxclients 1000
# Restrict Redis to use only 128 MB of memory
# More may result in service interruption
maxmemory 128m

A quick and easy way to do this is with Vim, a text-editor available through the terminal:

1. `vim ~/redis.conf`
2. Type `i` on the keyboard to switch to "Insert" mode
    - Depending upon client, paste the text through CTRL + V, Shift + INS, or a suitable key combination
3. Hit the Esc(ape) key.
4. Type `:wq`
5. _Done!_

Now to start Redis using the configuration, type: `redis-server ~/redis.conf`

### Starting on Start-up

1. Visit **Dev** > **Task Scheduler** within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) to schedule a new task.
2. Under **Command**, enter `redis-server ~/redis.conf`
3. Under _Scheduling_, select **Server Start**
4. Click **Add**

## See also

- Redis [documentation](http://redis.io/documentation)
- [The Little Redis Book](http://openmymind.net/2012/1/23/The-Little-Redis-Book/)
