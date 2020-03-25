---
title: "Mail sent to a hosted domain does not arrive if third-party MX records are present"
date: "2015-02-09"
---

## Overview

Mail sent to a domain hosted by your account that uses third-party MX records does not arrive to the intended recipient. Mail is instead delivered locally to the server that hosts your domain.

> _For example_, if `example.com` uses Google Apps to handle e-mail, and mail originates from the same hosting server as in from a script, like a contact form on a WordPress blog, mail would not reach its intended recipient at `contact@example.com`, which is accessed through Google Mail. Mail, instead, would be delivered to the local user named `contact` on the server.

## Cause

The domain is present in **Mail** > **Mail Routing** within the control panel. Any domain present in this list will bypass MX record lookups and the server will act as its final destination.

## Solution

Visit **Mail** > **Mail Routing** within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) and deauthorize the server from handling mail for that domain by deleting the record.
