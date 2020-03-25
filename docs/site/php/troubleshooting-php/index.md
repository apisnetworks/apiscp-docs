---
title: "Troubleshooting PHP"
date: "2015-01-09"
---

## Overview

PHP can fail for a variety of reasons. This is a growing list of reasons for which a PHP script may fail or behave inconsistently:

## Output

### Empty pages

#### Compiler error

By default, PHP will not display compile-time errors or any notice/error message. These are instead [logged](https://kb.apnscp.com/web-content/accessing-page-views-and-error-messages/) to improve security against malicious hackers. You can change this through a [.htaccess](https://kb.apnscp.com/guides/htaccess-guide/) directive: `php_flag display_errors on` located within the [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/).

**To resolve:** Depending upon the nature, there are a few solutions:

- **Syntax error**: correct the syntax mistake, use a suitable IDE to edit PHP files to avoid typos like [PDT](https://eclipse.org/pdt/) (free) or [PhpStorm](https://www.jetbrains.com/phpstorm/) (mixed cost)
- **Miscellaneous compiler errors**: ensure the PHP script has been uploaded properly to the FTP server. Sometimes, a bad FTP client will inappropriately try to resume a text file resulting in code spliced into itself by file offsets
    - Open a ticket in the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) and we'll direct you on this! happens more often than you'd expect

#### Bad cache retrieval

PHP utilizes an intermediate cache that takes compiled bytecode and saves it in memory to avoid  compilation every time a page is requested. In certain circumstances, bytecode compilation gets jumbled resulting in an empty page.

**To resolve**: Disable PHP caching. Depending on platform version, the following directive should be added to a [.htaccess](https://kb.apnscp.com/guides/htaccess-guide/) file within the [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/) of the affected web site:

- [v6](https://kb.apnscp.com/platform/determining-platform-version/) and newer platforms, which use OPcache: `php_flag opcache.enable off`
- [v5](https://kb.apnscp.com/platform/determining-platform-version/) and older platforms, which use APC: `php_flag apc.cache_by_default off`

## Interaction

### Undefined behavior

Behavior that exists beyond the expectations (ie. upload file stores a file) can result from deprecation or outright disuse of old constructs, like [register\_globals](http://php.net/manual/en/security.globals.php).

**To resolve: **purely situational, but there is an order of resolution:

1. Ensure that you are operating the latest version of the application
2. Look for errors in the [web server log files](https://kb.apnscp.com/web-content/accessing-page-views-and-error-messages/)
    - Open a ticket for assistance for any issues present
3. Add `php_flag display_errors on` and `php_value error_reporting 99999` to a [.htaccess](https://kb.apnscp.com/guides/htaccess-guide/) file in the [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/) of the application. Try to reproduce the issues looking for any additional output prefixed with "_PHP Error_" or "_PHP Notice_"
    - Can't resolve the issue based upon error/warning/notice context? Open a ticket and let us know how to reproduce it
4. In certain cases, there can be intricate complications between PHP, software, and even microcode
    - Open a ticket with steps to reproduce the issue, and we'll look into it
        - In the past, issues have ranged from unexpected Zend Engine interaction to CPU abnormalities
