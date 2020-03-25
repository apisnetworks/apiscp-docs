---
title: "open_basedir restriction message"
date: "2014-11-10"
---

## Overview

When attempting to access a file in PHP, the script will yield a warning similar to:

**Warning**: fopen(): open\_basedir restriction in effect. File(/var/www/myresource) is not within the allowed path(s): 
(/home/virtual/site2/fst:/var/www/html:/usr/local:/usr/bin:/usr/sbin:/etc:/tmp:/proc:/dev:/.socket) in **/home/virtual/site2/fst/var/www/html/myfile.php** on line **3**

## Cause

This is caused by mistakenly referencing a path within a pivot root inconsistent with PHP. PHP runs with a separate filesystem visibility for high-throughput performance, whereas FTP and control panel access require low-throughput, but heightened security. PHP implements a different security subsystem and different access rights.

## Solution

Prepend the _HTTP Base Prefix_ value taken from the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) under **Account** > **Summary** > **Web**. For example, the following PHP snippet would be corrected as follows:

<?php
   // INCORRECT
   // Will yield open\_basedir warning
   $key = file\_get\_contents("/var/www/secret.hash");
   // CORRECT
   $key = file\_get\_contents("/home/virtual/site12/fst/var/www/secret.hash");
?>

For convenience, the web server will populate an environment variable named `SITE_ROOT` that contains the value of _HTTP Base Prefix_. A better example would be:

<?php
   $key = file\_get\_contents($\_SERVER\['SITE\_ROOT'\] . "/var/www/secret.hash");
   // do whatever, $key works!
?>

Just don't forget too that PHP requires [special permissions](https://kb.apnscp.com/php/writing-to-files/) for write access!

## See Also

PHP: [Writing to files](https://kb.apnscp.com/php/writing-to-files/)
