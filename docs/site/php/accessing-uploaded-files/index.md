---
title: "Accessing uploaded files"
date: "2014-11-10"
---

## Overview

By default, uploaded files are stored under `/tmp`, which is outside the pivot root of your account's filesystem. These files may be accessed only by PHP. In certain circumstances, you may want to keep a copy of uploaded files for debugging.

## Solution

Upload path can be adjusted by changing PHP's [tunable setting](https://kb.apnscp.com/php/changing-php-settings/): `upload_tmp_dir`. Use the value within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) from **Account** > **Summary** > **Web** > **HTTP Base Prefix** + _/tmp_.

### Example

If **HTTP Base Prefix** is `/home/virtual/site125/fst`, then use the following value for `upload_tmp_dir` is valid in a [.htaccess](https://kb.apnscp.com/guides/htaccess-guide/) file:

`php_value upload_tmp_dir /home/virtual/site125/fst/tmp`
