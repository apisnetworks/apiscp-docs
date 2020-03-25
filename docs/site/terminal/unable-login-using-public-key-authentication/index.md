---
title: "Unable to login using public key authentication"
date: "2014-12-08"
---

## Overview

Ensure [correct permissions](https://kb.apnscp.com/guides/permissions-overview/) on `~/.ssh/` are `700` (u: rwx, g: -, o: -) and `~/.ssh/authorized_keys` is `600` (u: rw-, g: -, o: -). Provided the permissions are correct, then make sure your public key is listed in the `authorized_keys` file.

 

## See Also

[Permission overview](https://kb.apnscp.com/guides/permissions-overview/)
