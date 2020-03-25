---
title: "Changing Node Versions"
date: "2016-01-27"
---

## Overview

Platforms [v6.5+](https://kb.apnscp.com/platform/determining-platform-version/) and beyond support multiple Node versions that may be installed using [nvm](https://github.com/creationix/nvm).

## Usage

### Listing

nvm is provided automatically. First, to list available node interpreters, execute `nvm ls` from the [terminal](https://kb.apnscp.com/terminal/accessing-terminal/):

```
$ nvm ls
 v4.2.4
 v5.5.0
-> system
node -> stable (-> v5.5.0) (default)
stable -> 5.5 (-> v5.5.0) (default)
iojs -> N/A (default)
```

system is the system default. In additional, both v4.2.4 and v5.5.0 have been installed.

Use `nvm ls-remote` to show all remote Node packages available for installation on your account.

### Installing

To install a Node interpreter, simply run `nvm install _<version>_`, where _<version>_ is a remotely-available version from `nvm ls-remote`

```
$ nvm install v4.5.1
 Downloading https://nodejs.org/dist/v5.4.1/node-v5.4.1-linux-x64.tar.xz...
 ######################################################################## 100.0%
 WARNING: checksums are currently disabled for node.js v4.0 and later
 Now using node v5.4.1 (npm v3.3.12)

```

### Using

Switch Node interpreters with `nvm use _<version>_`, where _<version>_ is a locally installed Node interpreter.

$ nvm use 5.4.1
Now using node v5.4.1 (npm v3.3.12)
$ node -v
v5.4.1

`nvm alias default _<version>_` will save the _<version>_ interpreter as your system default next time you login, no further activation required.

### Path

Once you have settled on a Node interpreter, the absolute path may be discovered using [which](http://apnscp.com/linux-man/man1/which.1.html):

$ which node
~/.nvm/versions/node/v5.4.1/bin/node

Be sure to expand ~ to your [home directory](https://kb.apnscp.com/platform/home-directory-location/). This location be used with [Passenger](https://kb.apnscp.com/guides/running-node-js/) via `PassengerNodejs` to use a different Node, other than the system default, to handle requests.

## See also

- [nvm documentation](https://github.com/creationix/nvm/blob/master/README.markdown) (github.org)
- KB: [Running Node.js](https://kb.apnscp.com/guides/running-node-js/)
