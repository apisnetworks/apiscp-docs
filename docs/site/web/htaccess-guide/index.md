---
title: ".htaccess Guide"
date: "2014-11-09"
---

## Overview

An .htaccess file contains directives that the web server will apply to a collection of resources before a page is displayed. For example, a .htaccess file may change [PHP configuration](https://kb.apnscp.com/php/changing-php-settings/), deny access, change the page displayed, and even redirect a resource to another URL. These are denoted by a _directive_. A directive consists of a directive name and value, such as `DirectoryOptions +Indexes` or `php_flag display_errors on`.

## Directive precedence

Before changing how the web server works, it's important to know how these rules are applied. Before a request is processed, the server looks for a file called `.htaccess` in the directory in which [content is served](https://kb.apnscp.com/web-content/where-is-site-content-served-from/). Any directives in this file are applied. The server will then backtrack down each directory until it reaches `/var/www` applying whatever directives are present in whatever .htaccess files it finds along the way.

> ### Example
> 
> A page is served from `/var/www/mydomain.com`. .htaccess files are located present as `/var/www/mydomain.com/.htaccess` and `/var/www/.htaccess`. First, rules in `/var/www/mydomain.com/.htaccess` are applied. Then, any rules in `/var/www/.htaccess` are applied overriding any rules present under `mydomain.com/`.
> 
> _Be careful with addon domain locations! _.htaccess can be located under `/var/www` to apply global configuration to any subdomain or domain located under `/var/www`.

## Setting directives

Create a plain-text file named `.htaccess` that will be uploaded in the [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/) for the subdomain or domain whose behavior you would like to modify.

> You may also create an empty plain-text file [within the control panel](https://kb.apnscp.com/control-panel/creating-empty-files/) under **Files** > **File Manager**. You may then edit the file by clicking on the **Edit** action in the _Actions_ column to make changes from your browser.

Each directive is one-line long and placed on a separate line. For example, these are all _valid_ directives:

- `Options +Indexes`
- `RewriteCond %{HTTPS} ^ON$`
- `php_value error_reporting 99999`
- `PassengerEnabled On`

These are all _invalid:_

- Options
    - Reason: missing option values
- php\_value error\_reporting display\_errors on
    - Reason: extraneous PHP [configuration directives](https://kb.apnscp.com/php/changing-php-settings/)
- RewriteCond %{HTTPS} ^ON$ RewriteRule ^(.\*)$ https://mydomain.com/$1 \[R,L\]
    - Reason: each directive (RewriteCond, RewriteRule) must reside on its own line
- PassengerEnabled yes
    - Reason: "yes" is not an acceptable value for PassengerEnabled

## Handling Errors

Sometimes a directive may be improperly entered into your .htaccess file. In such cases, the web site will fail to display and an _Internal Server Error_ will be generated. You can refer to `[error_log](https://kb.apnscp.com/web-content/accessing-page-views-and-error-messages/)` for a detailed explanation of what directive was rejected and for what particular reason.

## Common Directives

Directive Name

Description

Example

Documentation

php\_value

Sets PHP runtime configuration

php\_value upload\_max\_filesize 32M

Apis Networks KB: [Changing PHP Settings](https://kb.apnscp.com/php/changing-php-settings/)

RewriteBase

Anchors a rewrite rule to the current directory

RewriteBase /

Apache Documentation: [Apache mod\_rewrite](http://httpd.apache.org/docs/2.2/rewrite/)

Options

Sets directory-specific options

Options +Indexes

Apache Documentation: [core](http://httpd.apache.org/docs/current/mod/core.html#options)

PassengerEnabled

Enable Rails, node.js, and Python autoloading

PassengerEnabled On

[Phusion Documentation](https://www.phusionpassenger.com/documentation/Users%20guide%20Apache.html#PassengerEnabled)
