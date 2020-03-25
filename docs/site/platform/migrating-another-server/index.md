---
title: "Migrating to another server"
date: "2015-01-20"
---

## Overview

Some time during your stay with us, you may want to migrate to a newer, more powerful, and capable server. We periodically release [major hosting platforms](https://kb.apnscp.com/platform/determining-platform-version/) built off the latest [Redhat Enterprise Linux releases](http://en.wikipedia.org/wiki/Red_Hat_Enterprise_Linux). You may do so at any time within the control panel by [opening a ticket](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) under **Help** > **Trouble Tickets**.

Migrations are 100% free, result in zero downtime, and take 24 hours to complete.

## Process overview

Migrations occur in 2 phases:

1. **Stage One**, a preview stage in which your files are migrated to the new server:
    - account created on destination server
        - if you run background services, the [preassigned ports](https://kb.apnscp.com/terminal/listening-ports/) will change. You are responsible for updating configuration files to avoid having these processes automatically killed on the new server
    - files, users, e-mail addresses, and databases are copied over
    - DNS TTL is [reduced](https://kb.apnscp.com/dns/reducing-dns-propagation-time/) to 60 seconds for domains that are designated our [hosting nameservers](https://kb.apnscp.com/dns/nameserver-settings/), `ns1.apnscp.com` and `ns2.apnscp.com`
        - this change takes 24 hours to safely propagate
        - Important: for domains not hosted through ns1.apnscp.com and ns2.apnscp.com, you will be required to manually make the IP address adjustments
    - You may [preview your domain](https://kb.apnscp.com/dns/previewing-your-domain/) on the new server upon notification **Stage One** has completed.
2. **Stage Two** finalizes changes exactly 24 hours after **Stage One** completes:
    - files, users, e-mail addresses, and database changes since **Stage One** are committed to the new server
        - databases on new server leftover from **Stage One** are first dropped, then recreated before importing schema
    - any scheduled tasks are now copied to the server and set to run
        - scheduled tasks on the old server are disabled to prevent duplicating tasks
    - IP address is changed from the old server IP to new server IP, TTL is increased back to 12 hours
    - account on old server is deactivated in favor of the new server
        - Note: this change will take 4-6 hours to update when logging into the control panel via [apnscp.com](https://apnscp.com/cp-login)
