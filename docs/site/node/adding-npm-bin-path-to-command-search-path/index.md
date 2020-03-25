---
title: "Adding npm bin/ path to command search path"
date: "2016-01-12"
---

## Overview

npm installs packages by default under `node_modules/` within the current working directory. Binary files, if bundled with a package, are installed under `node_modules/.bin/` unless the global (`-g`) flag is supplied to `npm install`. This works if only a single version of a particular package is installed, but fails in most multi-version setups.

## Solution

Add `node_modules/.bin/` to your search path, called "`PATH"`. `PATH` is a special environment variable in bash that defines the order of directories a file is searched for when executing a command.

Simply run this command from the terminal, making note of the single-quote (') and double-chevron (>>) usage:

echo 'PATH=$PATH:./node\_modules/.bin:../node\_modules/.bin' >> ~/.bash\_profile

Log out of the terminal and log back in.

**_Notes: _**it is acceptable to omit ../node\_modules/.bin from the path. This is used for situations like [Sails](https://kb.apnscp.com/node/sails-quickstart/) that create a separate directory for its application.

## See also

- [Orientation in the file system](http://tldp.org/LDP/intro-linux/html/sect_03_02.html) (TLDP)
