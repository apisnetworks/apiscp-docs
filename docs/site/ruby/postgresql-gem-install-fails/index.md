---
title: "PostgreSQL gem install fails"
date: "2015-11-03"
---

## Overview

Attempting to install the Ruby gem "pg" or other PostgreSQL-dependent gems on [v6+ platforms](https://kb.apnscp.com/platform/determining-platform-version/) fail with a similar sample response:

Can't find the PostgreSQL client library (libpq)
\*\*\* extconf.rb failed \*\*\*
Could not create Makefile due to some reason, probably lack of necessary
libraries and/or headers. Check the mkmf.log file for more details. You may
need configuration options.
Provided configuration options:
 --with-opt-dir

## Cause

PostgreSQL libraries are located in a separate directory, `/usr/pgsql-XX`, where _XX_ is the version number on these platforms. This path is not picked up in normal configuration.

## Solution

Install the gem manually while specifying a path to `pg_config`, which is located in `/usr/pgsql-XX/bin`. For example, on Sol, which ships with PostgreSQL 9.3, the correct command to install pg is as follows:

```
gem install pg -v '0.18.3' -- --with-pg-config=/usr/pgsql-9.3/bin/pg_config
```
