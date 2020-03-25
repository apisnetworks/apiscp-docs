---
title: "Using Composer"
date: "2016-01-07"
---

## Overview

[Composer](https://getcomposer.org/) is a dependency manager for PHP akin to npm for Node and Bundler for Ruby.

Composer is provided with hosting accounts on all [v5+ platforms](https://kb.apnscp.com/platform/determining-platform-version/). On an older platform? Request a platform migration! This guide covers installing a local copy of Composer on your account.

## Installing

You may download the latest version from its web site using its installation process. Login to the [terminal](https://kb.apnscp.com/terminal/accessing-terminal/), and run the following command:

```bash
curl -sS https://getcomposer.org/installer | php

```

A copy of Composer, as a [PHP archive](http://php.net/manual/en/book.phar.php), will be downloaded to your current directory. Composer may  now be invoked from the _current directory_ as follows:

php composer.phar

To create a global `composer` command, see the next section:

## Creating a "composer" command

This process will download Composer, move it to `/usr/local/bin`, and create an alias:

curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin
echo 'alias composer="php /usr/local/bin/composer.phar"' >> ~/.bash\_profile

Log out of the terminal, then log back in. Type `composer` to run the Composer application. To upgrade Composer again in the future, just run lines 1 and 2 (ignore `echo ... >> ~/.bash_profile`).

## See also

- [Composer documentation](https://getcomposer.org/doc/)
