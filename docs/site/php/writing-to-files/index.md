---
title: "Writing to files"
date: "2014-10-28"
---

## **Overview  
**

PHP operates as a separate user to enhance security across the server. In the event of a hacking event on a client’s site, the attacker only has access to what it can access, which protects sensitive e-mails and SSH keys that reside within the same storage space. Certain applications like WordPressand Drupal will complain that the application cannot write to storage typically manifested as a _Permission Denied_ error:

> **Warning**: fopen(<filename>) \[[function.fopen](https://kb.apnscp.com/function.fopen)\]: failed to open stream: Permission denied in **<filename>** on line **1**

## **Solution  
**

Selectively grant write access ([717 permission](https://kb.apnscp.com/guides/permissions-overview/)) to files and folders that you wish to let the application access. Permissions may be modified within the control panel under **Files **\> **File Manager **\> **Properties** action.

> Permissions may be applied recursively to reduce the number of steps required to allow a web application sufficient write access, but bear in mind _anywhere a web application can write to, so can an attacker if your site gets hacked._ It is best to change permissions on directories where file uploads may occur and manually install plugins to reduce your risk of getting hacked by failure to keep software updated.

Files created by the web server may be managed immediately though the **File Manager** or the following day by FTP once nightly housekeeping completes.

> **Important:** traditionally, PHP and site files operated under one user, for two major reasons: _accountability_ and _ease-of-use_. Accountability in that service providers providing unlimited resources can better target accounts that are unsuitable for a truly “unlimited” hosting plan (ie. consuming too many cpu resources). Running all WordPress applications under the same user allows administrators to flag abusive accounts that might lie above a [bell curve](http://en.wikipedia.org/wiki/The_Bell_Curve). Second, it’s easy to update files when all files accessed by the web server are owned by the same user. Permissions are [not an issue](https://kb.apnscp.com/guides/permissions-overview/). Just let the user update WordPress from WordPress’ dashboard and done.
> 
> _But there’s a huge problem running under one user!_ Any request on the domain, whether legitimate or forged, can be leveraged by an attacker. Because, the HTTP request assumes the same ownership as you, any PHP exploit\[[1](http://www.cvedetails.com/vulnerability-list/vendor_id-74/product_id-128/PHP-PHP.html)\]\[[2](https://cve.mitre.org/cgi-bin/cvekey.cgi?keyword=wordpress)\]\[[3](http://cve.mitre.org/cgi-bin/cvekey.cgi?keyword=drupal)\]\[[4](http://www.cvedetails.com/vulnerability-list/vendor_id-5025/Zend.html)\]\[[5](http://www.cvedetails.com/vulnerability-list/vendor_id-3496/product_id-6129/Joomla-Joomla.html)\] can be first leveraged to gain access, _then bootloaders_ (simple file managers) can be injected into any PHP script allowing an attacker to upload malicious scripts elsewhere so long as he knows the special key. _**Exploits do happen. Update regularly!**_
> 
> By running as a separate user, the window of opportunity is greatly limited. Only files that you _explicitly authorize write access_ can be modified by a PHP application. If a hacker can’t modify the file, then the hacker can’t inject a bootloader or other malicious code. Only let the web server write to locations that are necessary for operation. Setting permissions to 717 on only those directories/files that are updated regularly by a PHP application is a [great solution](https://kb.apnscp.com/guides/permissions-overview/) to reduce your surface exposure. But, don’t set these permissions on all files or your account is just as insecure as running under one user.

## **See Also**

[Permissions Guide](https://kb.apnscp.com/guides/permissions-overview/)
