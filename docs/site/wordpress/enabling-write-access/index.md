---
title: "Enabling write-access"
date: "2014-11-11"
---

## Overview

The web server operates in a dual-user mode for enhanced security. In order for a web application to access your filesystem, specific permissions must be granted.

## Solution

[Change permissions](https://kb.apnscp.com/php/writing-to-files/) on necessary files to [717 or 777](https://kb.apnscp.com/guides/permissions-overview/). For WordPress, `wp-content/uploads/` and `wp-content/themes/`  should be changed recursively to allow media uploads and theme editing in-browser. If plugin editing is desired, change permissions recursively on `wp-content/plugins` as well.

The same process may be done for any other plugins or themes than require write-access to any folder not covered above.

> **Important:** traditionally, PHP and site files operated under one user, for two major reasons: _accountability_ and _ease-of-use_. Accountability in that service providers providing unlimited resources can better target accounts that are unsuitable for a truly "unlimited" hosting plan (ie. consuming too many cpu resources). Running all WordPress applications under the same user allows administrators to flag abusive accounts that might lie above a [bell curve](http://en.wikipedia.org/wiki/The_Bell_Curve). Second, it's easy to update files when all files accessed by the web server are owned by the same user. Permissions are [not an issue](https://kb.apnscp.com/guides/permissions-overview/). Just let the user update WordPress from WordPress' dashboard and done.
> 
> _But there's a huge problem running under one user!_ Any request on the domain, whether legitimate or forged, can be leveraged by an attacker. Because, the HTTP request assumes the same ownership as you, any PHP exploit\[[1](http://www.cvedetails.com/vulnerability-list/vendor_id-74/product_id-128/PHP-PHP.html)\]\[[2](https://cve.mitre.org/cgi-bin/cvekey.cgi?keyword=wordpress)\]\[[3](http://cve.mitre.org/cgi-bin/cvekey.cgi?keyword=drupal)\]\[[4](http://www.cvedetails.com/vulnerability-list/vendor_id-5025/Zend.html)\]\[[5](http://www.cvedetails.com/vulnerability-list/vendor_id-3496/product_id-6129/Joomla-Joomla.html)\] can be first leveraged to gain access, _then bootloaders_ (simple file managers) can be injected into any PHP script allowing an attacker to upload malicious scripts elsewhere so long as he knows the special key. _**Exploits do happen. Update regularly!**_
> 
> By running as a separate user, the window of opportunity to exploit is limited. Only files that you _explicitly authorize write access_ can be modified by a PHP application. If a hacker can't modify the file, then the hacker can't inject a bootloader or other malicious code. Only let the web server write to locations that are necessary for operation. Setting permissions to 717 on only those directories/files that are updated regularly by a PHP application is a [great solution](https://kb.apnscp.com/guides/permissions-overview/) to reduce your surface exposure. But, don't set these permissions on all files or your account is just as insecure as running under one user.

## See Also

- PHP: [Writing to files](https://kb.apnscp.com/php/writing-to-files/)
- PHP: [open\_basedir restriction message](https://kb.apnscp.com/php/open_basedir-restriction-messages/)
- Guides: [Permission overview](https://kb.apnscp.com/guides/permissions-overview/)
