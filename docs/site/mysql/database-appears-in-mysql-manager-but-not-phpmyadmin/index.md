---
title: "Database appears in MySQL Manager, but not phpMyAdmin"
date: "2015-10-17"
---

## Overview

A MySQL database that appears within the control panel under **Databases** > **MySQL Manager** does not show in **Databases** > **phpMyAdmin**

## Cause

Read permissions have been revoked on that database from the primary user.

## Solution

Visit **Databases** > **MySQL Manager** > _Change Mode:_ **List Databases & Users** within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/).

1. Select the database that does not appear
2. Navigate to the primary user
3. _Read_ will be unchecked. Check _Read_ under privileges.
4. Click ****Save****
    
    \[caption id="attachment\_1133" align="aligncenter" width="300"\][![Sample permission listing where the database will not appear in phpMyAdmin due to insufficient permissions.](https://kb.apnscp.com/wp-content/uploads/2015/10/database-missing-300x102.png)](https://kb.apnscp.com/wp-content/uploads/2015/10/database-missing.png) Sample permission listing where the database will not appear in phpMyAdmin due to insufficient permissions.\[/caption\]
