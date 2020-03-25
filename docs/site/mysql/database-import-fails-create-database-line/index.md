---
title: "Database import fails: CREATE DATABASE line"
date: "2015-05-20"
---

## Overview

Restoring a database backup within the control panel, mysqli CLI, or phpMyAdmin may fail with the following message:

#1044 - Access denied for user 'myuser'@'localhost' to database 'mynewdb'

## Cause

A _CREATE DATABASE_ query is issued during database import that cannot succeed due to limited permissions. All databases must be created within the [control panel](https://kb.apnscp.com/mysql/creating-database/) to ensure proper account namespacing is applied.

## Solution

First create the destination database within the control panel.  Next, remove the lines that begin with: _CREATE DATABASE_ and _USE_. These lines normally occur consecutively.

CREATE DATABASE IF NOT EXISTS \`mynewdb\` /\*!40100 DEFAULT CHARACTER SET utf8mb4 \*/; USE \`mynewdb\`

becomes:

_<empty>_

When importing a database in phpMyAdmin select the database in the left panel, then select _Import_ from the tabs in the right panel.

When importing in mysql from the [terminal](https://kb.apnscp.com/terminal/accessing-terminal/), include the database name, e.g.

```
mysql -u username -ppassword mynewdb < dbbackup.sql
```
