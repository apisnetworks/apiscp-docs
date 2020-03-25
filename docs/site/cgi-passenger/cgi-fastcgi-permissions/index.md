---
title: "CGI and FastCGI permissions"
date: "2014-12-04"
---

## Overview

All CGI and FastCGI requests operate as the owner of the file and require heightened security to limit malicious behavior. There are a few guidelines that must be adhered to when a CGI or FastCGI script, ending in _.cgi_, is accessed on your hosting account:

1. File permissions must be 755 (u=rwx,g=rx,o=rx)
    - _Group_, _Other_ cannot have write permissions to inject unsafe code into your CGI script
    - _Other_ (web server) must be able to access the file before
2. Directory permission of the folder in which the CGI script resides must be 755 (u=rwx,g=rx,o=rx)
    - _Group_, _Other_ cannot create other files in the directory that may be sourced as CGI scripts
    - _Other_ (web server) must be able to open the directory to satisfy the request before wrapping with suEXEC
3. File owner must match directory owner
    - Prevents injection of arbitrary CGI scripts by other users into the same directory (_see #2 above_)
4. File must be executable from the shell
    - suEXEC runs script in its process space via a [execve](http://linux.die.net/man/2/execve) system call

[Permission changes](https://kb.apnscp.com/guides/permissions-overview/#changing) may be made either via FTP or **Files** > **File Manager** within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/). To evaluate whether a script works from the shell, it should consist of a shebang at the start of the file, generally in the form `#!/usr/bin/exec args`. Examples of common shebangs include:

- Python: `#!/usr/bin/env python`
- PHP: `#!/usr/bin/php -q`
- Perl: `#!/usr/bin/perl`
- Bash (shell script): `#!/bin/sh`

Note: these all have #! in common on the first line. This notation is called the "shebang" and follows the pattern: <shebang><path to executable> followed by a Unix-style newline (\\n). If a shebang follows with a Mac or Windows-style EOL marker (\\r and \\r\\n respectively), the script will fail. EOL markers may be [changed](https://kb.apnscp.com/control-panel/changing-eol-markers/) within the control panel.

## See Also

[Permission overview](https://kb.apnscp.com/guides/permissions-overview/)
