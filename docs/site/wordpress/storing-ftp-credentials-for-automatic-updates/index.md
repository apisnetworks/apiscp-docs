---
title: "Storing FTP credentials for automatic updates"
date: "2015-09-01"
---

## Overview

WordPress periodically deploys updates to secure flaws within its code or provide general enhancements. These updates are rolled out in the form of releases that, as of WordPress 3.7, can occur in the [background automatically](https://codex.wordpress.org/Configuring_Automatic_Background_Updates) without requiring user intervention. If permissions prohibit, WordPress cannot perform an automatic update and require user intervention to [manually update](https://kb.apnscp.com/wordpress/updating-wordpress/).

## Solution

Edit `wp-config.php` located within the [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/) of your WordPress domain or base of the subdirectory if located elsewhere under a domain. Add the following 3 lines to the end of your configuration file:

/\*\* Setup FTP Details \*\*/
define("FTP\_HOST", "localhost");
define("FTP\_USER", "your-ftp-username");
define("FTP\_PASS", "your-ftp-password");

Substitute, of course, _your-ftp-password_ and _your-ftp-username_ with your [FTP credentials](https://kb.apnscp.com/ftp/accessing-ftp-server/). FTP\_HOST should remain the same ("_localhost_").

## Caveats/Warnings

Since your FTP configuration, which is equivalent to control panel credentials, is stored in a `wp-config.php` file accessible by the web server, if an attacker gains unauthorized access to your WordPress installation, then the attacker will also have access to view the credentials inside `wp-config.php`. For this reason, it is advised that if you choose this route, create a new user within the control panel (**User** > **Add User**) to manage web files apart from the primary user on the account. In the event this account is compromised, then the attacker would only have access to the FTP account for that user, and not the master control panel login. _And even then, if the account were hacked, an attacker would already be able to snoop those files!_
