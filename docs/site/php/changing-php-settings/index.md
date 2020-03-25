---
title: "Changing PHP settings"
date: "2014-10-29"
---

## Overview

Certain default PHP settings may be insufficient for an application. For example, it may be necessary to accept large file uploads or display errors on-screen to facilitate rapid prototyping during early stages of an application.

## Solution

PHP settings may be changed 2 ways, each with varying scope. All settings except for `open_basedir` and `memory_limit` may be adjusted.

### .htaccess

Create a [.htaccess file](https://kb.apnscp.com/guides/htaccess-guide/) called `.htaccess` within the [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/) for a given domain. Rules will be applied recursively to all assets within that directory. If domains or subdomains are nested within that directory, then rules will apply to those additional domains as well.

> A special-use case is creating a file called `.htaccess` in `/var/www` that will apply rules to all subdomains and domains located anywhere within `/var/www`. This is a great, effective way to make global adjustments to all web content and likewise toggle off with minimum effort.

PHP directives come in 2 forms: `php_value` and `php_flag`. `php_flag` is to toggle a value on or off and takes 1 of 2 values: `On` or `Off`.

**Example:**`php_flag display_errors On` This example will show errors in the browser as encountered.

`php_value` takes a non-toggleable value that can be anything. Always surround these values with quotes (_"..."_) to ensure the value is correctly parsed.

**Example:**`php_value upload_max_filesize "50M"` This example will increase the maximum supported filesize to 50 MB for uploads.

### Per-Script

Settings can be applied to a single PHP script within a folder via [ini\_set()](http://php.net/ini_set). `ini_set`() takes 2 parameters, a directive and value and must be applied to the file ending in _`.php`_. PHP commands always go after the opening declaration, _<?php._ It is similar as above, except unlike `php_flag` above, On is simply `true` and Off is `false`.

_Example_:

<?php
 ini\_set('upload\_max\_filesize', '40M');
 ini\_set('error\_reporting', E\_ALL);
 ini\_set('display\_errors', false);
 // start the application
 include("loader.php");
 Loader::doStuff();
?>

At the start of a PHP script, `ini_set()` commands are injected to increase file upload size, suppress displaying errors in the browser, and log all errors.

## See Also

- PHP.net: [description of core php.ini directives](http://php.net/manual/en/ini.core.php)
- KB: [Viewing PHP settings](https://kb.apnscp.com/php/viewing-php-settings/)
