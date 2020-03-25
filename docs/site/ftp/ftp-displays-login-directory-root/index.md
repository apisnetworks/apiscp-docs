---
title: "FTP displays login directory as root"
date: "2014-12-22"
---

## Overview

Logging into the FTP server with a client will present the home directory, or custom directory, as the root directory. The user logged in is unable to move up the directory to its parent directory or any other directory outside the initial login directory.

## Cause

### Defective FTP Client

Certain clients, such as Windows Explorer, improperly translate the initial directory as root. Consider the following FTP exchange:

Response: 230 Login successful.
Command: pwd
Response: 257 "/home/mylogin"
Command: TYPE A
Response: 200 Switching to ASCII mode.

The FTP client should present the initial directory as `/home/mylogin`. For clients that improperly implement FTP protocol, it will be represented as `/`; consequently, the FTP client cannot move up a directory or elsewhere, e.g. to `/home` or `/var/www/html`.

**Solution:** Use a different [FTP client](https://kb.apnscp.com/ftp/accessing-ftp-server/#recommended) or upgrade your current FTP client.

### Jailed User

Secondary users may be jailed within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) under **User **\> **Manage Users** > _select user_ > **FTP > Jail**. Upon login, the user will only be able to access directories and files within that specified directory. No other resources may be accessed.

**Solution:** Disable jail access to restore access to the rest of the filesystem.
