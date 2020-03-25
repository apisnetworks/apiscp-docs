---
title: "Platform isolation overview"
date: "2015-10-08"
---

## Overview

Apis Networks utilizes a unique platform that consists of multiple security subsystems and user roles to yield optimal throughput and keep your account secure. This article will explain how account partitioning works.

## Filesystem Layers

Every account is comprised of several layers of files. These layers are read-only and provide a basic environment for services to operate. The top-most layer is a read-write **client layer**. Any file created within the **pivot root** resides on this top-most layer. Any file in the read-only layer is copied up to the **client layer**. If a duplicate file exists on multiple layers, the top-most layer is used. It will always be the read-write **client layer**. Every **client layer** is separate from _other_ **client layers** ensuring integrity.

/home/virtual/site180/shadow/.aufs.xino
/home/virtual/site180/shadow=rw
/home/virtual/FILESYSTEMTEMPLATE/siteinfo=ro
/home/virtual/FILESYSTEMTEMPLATE/ssh=ro

**Figure:** A sample filesystem layout. "ro" is read-only. "rw" is read-write. FILESYSTEMTEMPLATE are part of the basic layer shared by all accounts. ".aufs.xino" is a system file used by aufs for inode recycling/translation.

### Benefits

By keeping multiple layers shared between accounts, updates can be easily deployed, as well as new features. Separate layers also allow the primary user to manipulate system files without affecting other users or server integrity. In the event of an [account hack](https://kb.apnscp.com/platform/handling-a-hijacked-account/), damage is limited only to the account read-write layer, which is isolated from system layers.

## Pivot Roots

Every process, except for PHP, operates within a **pivot root**. A **pivot root** is a separate filesystem with a separate environment from the main server that provides an environment in which applications can run. Each account has a **pivot root** tailored to that account. Depending upon the services enabled (terminal, Ruby, Java), different layers will be incorporated into the **pivot root**.

### Benefits

A pivot root provides a personalized experience for you comprised of your files. As you add, remove, and modify it, every application spawned from your account will inherit these changes. This ensures that your account will remain consistent and independent from its neighbors, like a virtual private server, as it ages. In the event of an [account hack](https://kb.apnscp.com/platform/handling-a-hijacked-account/), damage is limited only to the account read-write layer, which is isolated from other accounts.

## PHP

PHP is the exception to the rule. PHP operates as an interpreted language embedded within the HTTP server (ISAPI module) for performance. HTTP processes have access to the entire filesystem, which is a composition of the system service filesystem + account **pivot roots**. As HTTP processes spin-up and spin-down to accommodate server loads, the PHP interpreter is copied into each process. Consequently, only the HTTP process is necessary to serve a page, unlike CGI implementations that spawn a _separate PHP process_ to handle runtime compilation. CGI implementations leave behind dormant processes with compiled code in-memory anticipating future requests. ISAPI, on the otherhand, immediately releases the memory occupied by code anticipating a new request. This provides a **memory-efficient implementation for PHP and the highest throughput**.

### PHP Security

Since PHP requests operate outside of a **pivot root**, special care is necessary to ensure PHP can only access your files and run trusted code. A separate set of directory restrictions are in place restricting PHP from accessing files outside your [absolute root](https://kb.apnscp.com/php/open_basedir-restriction-messages/). A second pass restricts access to binaries non-conducive to PHP, including `rm`, `mv`, and `cp` via [access control lists](https://wiki.archlinux.org/index.php/Access_Control_Lists). A table below provides the PHP functions that provide similar functionality to the respective Linux commands:

_PHP equivalents of shell functions_

Shell command

PHP equivalent

mv

[rename](http://php.net/rename)(oldname, newname)

cp

[copy](http://php.net/copy)(src, dest)

rm

[unlink](http://php.net/unlink)(file)

rmdir

[rmdir](http://php.net/rmdir)(dir)

touch

[touch](http://php.net/touch)(file)

## See also

- KB: [open\_basedir restriction message](https://kb.apnscp.com/php/open_basedir-restriction-messages/) (PHP)
