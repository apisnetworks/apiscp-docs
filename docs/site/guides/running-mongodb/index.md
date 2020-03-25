---
title: "Running MongoDB"
date: "2015-02-17"
---

## Overview

[MongoDB](http://www.mongodb.org/) is fast, document-oriented [NoSQL](http://en.wikipedia.org/wiki/NoSQL) server. It's complementary to key-value cache stores like [Redis](https://kb.apnscp.com/guides/running-redis/) or Memcached and is suitable [when necessary](http://stackoverflow.com/questions/5400163/when-to-redis-when-to-mongodb). It is available on [newer platforms](https://kb.apnscp.com/platform/determining-platform-version/) (v6+) without any [additional compilation](https://kb.apnscp.com/terminal/compiling-programs/) from source. Accounts [with terminal access](https://kb.apnscp.com/terminal/is-terminal-access-available/) are eligible to use MongoDB.

## Quickstart

1. From the [terminal](https://kb.apnscp.com/terminal/accessing-terminal/), first create a directory to store MongoDB data:
    - mkdir ~/mongodb
        
        - A directory named `mongodb` within your [home directory](https://kb.apnscp.com/platform/home-directory-location/) will be created. If the user logged is in named `example`, then a directory named `/home/example/mongodb` will be created
2. Now start the server. Substitute PORT for a [preassigned port](https://kb.apnscp.com/terminal/listening-ports/) for your account:
    - `mongod --bind_ip 127.0.0.1 --port PORT --dbpath ~/mongodb --logpath ~/mongo.log --pidfilepath ~/mongodb.pid --fork`
    - MongoDB is now running, accessible by a local TCP/IP socket bound to port _PORT_.

**Note:** use 127.0.0.1 to prevent outside network activity. 127.0.0.1 will only allow traffic that originates from the same server. A better solution, if using [Node.js](https://kb.apnscp.com/guides/running-node-js/) or [Rails](https://kb.apnscp.com/ruby/setting-rails-passenger/) application, is to specify `--unixSocketPrefix`` /tmp/mongodb.sock` instead of `--bind_ip`/`--port` to specify a local UNIX domain socket instead of a TCP socket.

## Configuring & Daemonizing

Now with MongoDB up and running, you can create a long-term solution that starts up with the server and always runs in the background. Start with the configuration template provided above, making sure to update the `port` parameter to a [port assigned](https://kb.apnscp.com/terminal/listening-ports/) to your account.

> **Note**: as with most configuration files, any line that begins with a octothorpe/pound/hash symbol (#) denotes a comment. These are never interpreted by an application, but serve as guidance. The following configuration omits these helpful comments for brevity.

Copy and paste the following content to a file named `mongodb.conf` in your [home directory](https://kb.apnscp.com/platform/home-directory-location/):

bind\_ip = 127.0.0.1 
############
# Substitute with a PORT assigned to your account
############
port = PORT 
# run as a service
fork = true 
############
# Substitute /home/example for your HOME DIRECTORY
############
pidfilepath = /home/example/mongod.pid 
logpath = /home/example/mongodb.log 
dbpath = /home/example/mongodb 
journal = true
nohttpinterface = true

A quick and easy way to do this is with Vim, a text-editor available through the terminal:

1. `vim ~/mongodb.conf`
2. Type `i` on the keyboard to switch to "Insert" mode
    - Depending upon client, paste the text through CTRL + V, Shift + INS, or a suitable key combination
3. Hit the Esc(ape) key.
4. Type `:wq`
5. _Done!_

Now to start MongoDB using the configuration, type: `mongod -f ~/mongodb.conf`

### Starting on Start-up

1. Visit **Dev** > **Task Scheduler** within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) to schedule a new task.
2. Under **Command**, enter `mongodb ~/mongodb.conf`
3. Under _Scheduling_, select **Server Start**
4. Click **Add**

## See also

- MongoDB [documentation](http://docs.mongodb.org/manual/)
- [The Little MongoDB Book](http://openmymind.net/2011/3/28/The-Little-MongoDB-Book/)
