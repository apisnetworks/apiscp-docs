---
title: "Increasing max file upload size"
date: "2015-10-08"
---

## Overview

By default, file uploads are restricted to less than 32 MB, on a [server-by-server](https://kb.apnscp.com/php/viewing-php-settings/) basis, to prevent abuse by unauthorized activity. If you need a larger allowance, a few variables are necessary to tune.

## Solution

Allowing larger file uploads consists of three tunable variables. These variables may be tuned either through an [.htaccess](https://kb.apnscp.com/guides/htaccess-guide/) or [ini\_set](https://kb.apnscp.com/php/changing-php-settings/). For simplicity, the following example will assume adjustment in a `.htaccess` file.

Only `upload_max_filesize`, `post_max_size`, and `memory_limit` are relevant tunable parameters. `max_execution_time` and `max_input_time` do not [affect uploads](http://stackoverflow.com/questions/11387113/php-file-upload-affected-or-not-by-max-input-time).

**upload\_max\_filesize**: controls the maximum file upload size permitted in a form. This can be suffixed with "m" to denote a size in megabytes, e.g. `php_value upload_max_filesize 32m`

**post\_max\_size**: a sum of _all_ parameters submitted by a form. As a general rule: this should be approximately 33% more than upload\_max\_filesize, e.g. `php_value most_max_size 42m`

> **Explanation**: all submitted file uploads are transcoded to [base64](https://en.wikipedia.org/wiki/Base64), which results in approximately a 33% increase in actual consumption (over initial input). Therefore, simply, if an upload is 6 MB, anticipate an actual input of ~ 9 MB. This value must be higher than `upload_max_filesize` because there are control variables that dictate the file upload constraints ([session](http://php.net/manual/en/reserved.variables.session.php) variables) that [must be included](http://www.amazon.com/Programming-PHP-Kevin-Tatroe/dp/1449392776) in transmission. post\_max\_size must accommodate `upload_max_filesize` x 33% + input vars, which typically occupy only a few hundred kilobytes.

**memory\_limit**: this is a non-tunable parameter, _without justification_,  By default, limits are set to 96 MB on pre-v6 [platforms](https://kb.apnscp.com/platform/determining-platform-version/) and 192 MB on v6+ platforms. `memory_limit` affects the amount of memory a PHP script may occupy, in addition to file buffers that may be loaded into memory (_think [file\_get\_contents](http://php.net/file_get_contents) swallowing a file; [fread](http://php.net/fread) would only buffer up to n bytes so long as temporary variable storage is recycled in an iterative loop!_). Depending upon implementation, memory\_limit may have no impact on file uploads. It succinctly boils down to the maxim of _"don't do bad things"_; **_don't write crappy code_**!

If you are at the mercy of crappy code, open a ticket for us within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) to take a look at it and determine a reasonable course of action. We'll perform an appraisal of your situation, and in most situations, raise your memory limit.
