---
title: "Installing Laravel"
date: "2016-01-07"
---

## Overview

Laravel is a PHP framework built around abstraction: do more with less coding. Laravel runs off PHP and MySQL. It is supported on any [package](https://apnscp.com/hosting), but works best with a package that [supports terminal](https://kb.apnscp.com/terminal/is-terminal-access-available/) access. For this guide, we will assume terminal access is available.

## Installation

Begin by logging into the [terminal](https://kb.apnscp.com/terminal/accessing-terminal/).

1. **PREREQUISITE:** Install [Composer](https://kb.apnscp.com/php/using-composer/) if it has not already been installed.
2. Install Laravel in a new directory called `laravel/` under `/var/www` using Composer:
    
    cd /var/www
    composer create-project laravel/laravel laravel
    
    Note: "laravel" is intentionally present 3 times, the argument format to `composer create-project` is _channel_/_package_ _directory_
3. Change permissions on Laravel asset directories to permit [write-access](https://kb.apnscp.com/php/writing-to-files/) of logs, compiled views, and temporary file storage.
    
    cd laravel/
    chmod -R 777 storage bootstrap/cache
    
4. Connect Laravel to a [subdomain](https://kb.apnscp.com/web-content/creating-subdomain/) or [addon domain](https://kb.apnscp.com/control-panel/creating-addon-domain/) within the control panel under **Web** > **Subdomains**. Specify `public/` for its [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/); in the above example, this path is `/var/www/laravel/public`

### Empty output

Certain combinations of Laravel and PHP may yield a page without content. In such situations, [turn off output\_buffering](https://kb.apnscp.com/php/changing-php-settings/) in the [.htaccess](https://kb.apnscp.com/guides/htaccess-guide/) file located under `public/`:

php\_value output\_buffering 0

## See also

- [Laravel documentation](https://laravel.com/docs/)
- [Laravel implementation](http://laravel.sandbox.apnscp.com) on Sol, a [v6](https://kb.apnscp.com/platform/determining-platform-version/) platform
- KB: [Working with Laravel config:cache](https://kb.apnscp.com/php/working-laravel-config-cache/)
