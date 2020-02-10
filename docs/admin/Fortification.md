# Fortification

Fortification separates write access from the web server, specifically PHP applications that are a common vector of abuse. If a site is breached through a PHP application, such as a derelict WordPress plugin, then with Fortification enabled an attacker may only modify files explicitly granted access, typically media or cache files. An attacker cannot modify system files, snoop through personal files, or view files belonging to others unless permissions allow.

Detailed recovery techniques are discussed in Audit.md. This document covers the basics of Fortification and how to apply it.

## Benefits of Fortification

Fortification yields two benefits:

First, in the event that your site is hacked, the attacker has limited mobility. Backdoors are frequently installed in system files that give the attacker multiple methods of re-entry once the initial ingress point has been secured (often, outdated software installed on that web site). Unless fortification explicitly permits write-access to those files, an attacker cannot install a backdoor. Those access points that the web application may write, e.g. /wp-content/uploads for WordPress or /administrator/cache in Joomla, are further limited by our security policies to disallow public access or serve only static content such as images, movies, or downloadable files.

Second, if a breach were to occur, running as a secondary user limits the scope of damage. An attacker is unable to snoop through your email, compromise your ssh keys, or gain access to the control panel. Damage is superficial at best. In addition, because these files are flagged with web application as its creator/owner, it makes audit trails very easy to establish allowing for us to quickly inoculate your site.

Fortification is a feature to help keep your account secure, but it does not make your account secure. Judicious use of third-party plugins, software updates, and strong passwords do. apnscp covers **automatic updates** for WordPress, Joomla!, Drupal, and Magento, but there are thousands of web applications that users opt to install that are not enrolled in our automatic update program.

![fortification-mode](../images/fortification-diagram.png)

## Fortification Modes

Applications support a variety of fortification modes depending upon what support is provided in the control panel codebase. Only Learning Mode is enabled for unknown applications. For other supported applications, the following three fortification modes apply.

**Learning Mode**: if an application is not recognized or has not been previous detected, then Learning Mode is enabled. Learning Mode allows 100% write-access to the document root. After 30 minutes, a background task calculates what files have been modified, then establishes a fortification personality for that web site. Only files created or modified during that window will be allowed future write-access.

**Fortification On (MIN)**: Minimum Fortification allows the greatest degree of freedom by the web application to write to and modify files. When enabled, you should never be prompted to change permissions on any files. Consequently, an attacker will have access to modify more files, including vital system files and potentially alter your [.htaccess](https://kb.apiscp.com/guides/htaccess-guide/) file – if present – to alter the way in which your web site is handled by the server.

**Fortification On**: Normal Fortification is the maximum reasonable fortification for a web site as established by our development team. You may need to alter permissions of files (or enable *Web App Write Mode*) to allow write-access in extreme situations, such as installing a new plugin or updating the application system files from its built-in update panel if supported by the web app and not supported by the control panel. Most paths are also filtered to serve assets as-is reducing the ability a hacker has to leverage secondary backdoors installed once the site becomes compromised.

**Web App Write Mode**: Web App Write Mode releases fortification on a 10 minute timer. After 10 minutes has elapsed, Normal Fortification is enabled. This is useful in situations where new plugins are installed or in-place updates are performed.

**Release Fortification:** disable fortification on the web app entirely and allow write-access to every file on the site to the web application. Typically *very dangerous*.
