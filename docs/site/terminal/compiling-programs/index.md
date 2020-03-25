---
title: "Compiling programs"
date: "2014-12-02"
---

## Overview

Custom programs may be compiled on [Developer+](https://kb.apnscp.com/terminal/is-terminal-access-available/) accounts, which is also bundled with terminal access. Custom programs may be installed under `/usr/local`.

## Per-Language

### C/C++

For C/C++ applications, supplying a `--prefix=/usr/local` during `./configure`, i.e. `./configure --prefix=/usr/local && make && make install`. In particular, this is negotiated not by C itself, but rather make/[gmake](http://www.gnu.org/software/make/) and [autoconf](https://www.gnu.org/software/autoconf/) applications that are used in conjunction with C/C++ applications to manage program location along its [toolchain](http://en.wikipedia.org/wiki/GNU_toolchain).

Some applications abstain from autoconf usage, and require [editing](https://www.freebsd.org/doc/en/books/porters-handbook/porting-prefix.html) `DESTDIR` or `PREFIX` in `Makefile` bundled with the application. Few established applications adopt this usage.

### PHP

This is automatically negotiated without further changes during the install process.

### Ruby

This is automatically negotiated without further changes during the install process.

### Python

This is automatically negotiated without further changes during the install process.

### Perl

This is automatically negotiated without further changes during the install process.

## See Also

[Listening on ports](https://kb.apnscp.com/terminal/listening-ports/)
