---
title: "Switching PHP versions"
date: "2016-02-17"
---

## Overview

All platforms run a secondary web server with an older version of PHP other than the default. On newer platforms, [v6+](https://kb.apnscp.com/platform/determining-platform-version/), this interpreter is PHP 5.4. These secondary interpreters are deprecated and should only be used temporarily until the offending site can be updated to make use of the latest, more secure release of PHP.

## Usage

An site may be proxied to the secondary interpreter via a [.htaccess](https://kb.apnscp.com/guides/htaccess-guide/) file located in its [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/).

- All servers run the secondary interpreter on port 9000.
- All [v6+](https://kb.apnscp.com/platform/determining-platform-version/) platforms will also require a ticket to be opened _only once_ so initial configuration may be setup for the account.
    - Alternatively, use [Beacon](https://kb.apnscp.com/control-panel/scripting-with-beacon/): [php\_enable\_fallback](https://api.apnscp.com/docs/class-Php_Module.html) to enable support from the terminal

Add the following lines to the .htaccess file:

RewriteEngine On
RewriteBase /
RewriteCond %{SERVER\_PORT} !=9000
RewriteRule ^(.\*)$ http://%{HTTP\_HOST}:9000/$1 \[P,L,QSA\]

## Verifying

Once the rules have been setup, create a new [phpinfo script](https://kb.apnscp.com/php/viewing-php-settings/) in the document root, for example named `phpinfo.php`, that contains the following line:

<?php phpinfo();

Upon successful completion, a different PHP version will appear in the heading.
