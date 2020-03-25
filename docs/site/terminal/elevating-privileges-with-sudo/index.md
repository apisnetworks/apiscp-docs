---
title: "Elevating privileges with sudo"
date: "2016-01-18"
---

## Overview

Newer platforms, v6+, provide limited sudo support that allows you to remove, copy, and change ownership of files with elevated permissions (root). Depending upon the [platform version,](https://kb.apnscp.com/platform/determining-platform-version/) either  `rm` (v6) or `rm`, `cp`, and `chown` (v6.5+) commands are available.

## Usage

sudo follows a general syntax: `sudo` `command` `arguments`. Certain commands have restrictions on what arguments can be used. sudo may only be used within the [terminal](https://kb.apnscp.com/terminal/accessing-terminal/) and requires you to enter your password to confirm intention.

### rm

rm is used to remove files. Any file may be removed, including system files on your account, so be cautious on usage! There are no restrictions on usage.

Example: `sudo rm -rf /home/bob/bobswebsite.com`

### cp

_available on v6.5+ platforms only_

copy a file or set of files from a source to destination path. cp may be invoked without any flags or with `-dR`:

Example: `cp myfile.txt mynewfile.txt`

Example: `cp -dR /home/bob/bobswebsite.com /var/www/bobstaging` Copy contents of bobswebsite.com to `/var/www/bobstaging`, which may be an [addon domain](https://kb.apnscp.com/control-panel/creating-addon-domain/) or [subdomain](https://kb.apnscp.com/web-content/creating-subdomain/) to test changes to bobswebsite.com

Limitations

- any system file copied will be inherited towards the account storage usage
- optionally accept the recursive (-R) flag and symlink deference (-d)
- may not accept any other flags

### chown

_available on v6.5+ platforms only_

Change ownership of a file or set of files.

Example: `chown -R myadmin /home/bob/bobsmysite` Change ownership of bobsmysite, recursively to user "myadmin" for easy file management by myadmin

Example: `chown apache /var/www/wp/wp-config.php` Change ownership of `wp-config.php` in `wp/`, a [WordPress](https://kb.apnscp.com/wordpress/installing-wordpress/) directory, so the web server may write to it during a configuration change.

Limitations

- optionally accept the recursive flag (-R) to change ownership of all files in a directory
- may not accept any other flags
- may not alter group ownership (_newuser:root _is illegal)
- must use an absolute path, e.g. `chown newuser /var/www/myfile`
    - the absolute path may reside within /var or /home only
    - the path may not traverse directories, e.g. _/var/../root_
