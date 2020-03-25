---
title: "Problems deleting files"
date: "2014-12-22"
---

## Overview

FTP provides a convenient interface to quickly delete multiple files from a your site with minimal overhead. Problems can exist in multi-user environments where files are owned by one of many different users.

## Cause

FTP abides by _[UNIX discretionary access controls](http://en.wikipedia.org/wiki/Discretionary_access_control)_ (DAC) that restricts what files users can delete/modify/read. Without requisite permissions these files, owned by a user other than who is logged into the FTP server, cannot be removed.

## Solution

There are 4 solutions:

- Change ownership on the files to match the user logged into FTP through **Files** > **File Manager** >  **Properties** beneath the _Actions_ column within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/).
- Use the **File Manager** to remove these files.
    - File Manager ignores DAC for the primary user
- Recursively [change permissions](https://kb.apnscp.com/guides/permissions-overview/) to 777 on the directory and its descendants recursively within the control panel through the **File Manager** **Properties** dialog.
    - Extremely unsafe, but fastest to delete files of mixed users
- Log into the FTP server as the owner of the file to remove those files. In situations where the owner is _apache_ (web server role), then these files may be deleted by the primary account holder 24 hours after the file is created– a separate task runs nightly to open up privileges.

##  See Also

[Permissions Overview](https://kb.apnscp.com/guides/permissions-overview/)
