---
title: "Connecting remotely to MySQL"
date: "2014-12-03"
---

## Overview

By default, MySQL permissions only permit same-server access for clients. This protects your database by preventing external access, but also precludes desktop database utilities like [Navicat](http://navicat.com/), [MySQL Workbench](http://www.mysql.com/products/workbench/), and [Eclipse](https://eclipse.org/pdt/) from managing your database schema.

## Solution

Create a new MySQL user within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) under **Databases** > **MySQL Manager**.

- Enter a user under _Name_
    - Remember: your newly-created user will be prefixed with your database prefix that precedes the input field
- Enter a password under the _Password_ field
- Select **Advanced** mode
- Enter a new host under the _Host_ field
    - Only IP addresses are accepted
    - Use \_ and % for single/multiple wildcards
        - 64.22.\_0.1 matches 64.22.10.1 and 64.22.90.1 _but not 64.22.110.1_
        - 62.22.% matches 64.22.68.1, 64.22.110.230, etc _but not 64.23.110.230_
        - 64.22.%.1 would match 64.22.68.1, 64.22.230.1, _but not 64.22.230.2_
- Click **Add User**

A user has been created, but now requires database privileges:

- Select _Change Mode_ > **List Users and Databases**
- Select the database under _Edit Databases_ > _Database Name**. **_
- Under _User Privileges_, select **READ** and **WRITE**
    - READ will permit the user to connect and issue _SELECT_ statements
    - WRITE will permit _INSERT_, _UPDATE_, and _DELETE_
- Click **Save**

Connect to the database using your [server name](https://kb.apnscp.com/platform/what-is-my-server-name/) (or domain name), and corresponding username + password previously created. Port is the default port 3306.
