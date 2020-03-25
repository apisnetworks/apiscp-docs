---
title: "Bulk importing addresses"
date: "2015-04-03"
---

## Overview

When migrating over hosting providers, it may be necessary to add e-mail addresses en masse. Addresses can be added within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/).

1. Visit **Mail** > **Manage Mailboxes**
2. Select **Add Multiple Addressses**
    - Bulk address form will slide down
3. Enter each address to create on its own line, format follows: _<email1> <forward1>, <forward2>, <forwardN>... <email2> <forward1>, <forward2>, <forwardN>... <emailN> <forward1>, <forward2>, <forwardN>... ..._
4. Click **Bulk Add Addresses**

### Syntax rules

**Extrapolation**

The first value is the e-mail address to create. If no domain is specified, then the domain used to log into the control panel is assumed, e.g. myadmin matt@apnscp.com, joe@example.com

If logged in using domain `example.com`, then the address created is `myadmin@example.com`

**Wildcard**

A wildcard may be specified as an address to create using an asterisk ("`*`"). If specified, an e-mail address on every [authorized hostname](https://kb.apnscp.com/e-mail/authorizing-hostnames-handle-e-mail/) is created to forward to the specified destination.

An example wildcard input is, help@\* myuser

If 2 domains exist, `example.com` and `apnscp.com` (as an [addon domain](https://kb.apnscp.com/control-panel/creating-addon-domain/)), then this expands to:

help@example.com myuser@example.com help@apnscp.com myuser@apnscp.com

**Local Users**

Any destination forward not qualified as a domain, e.g. _@example.com_ is treated as a local user delivery. It follows the same rules as if the e-mail were created as a forward with **Local Users** selected in **Mail** > **Manage Mailboxes**. Namely, the _login_ domain is appended to the destination domain.

### Example syntax

This is a very simple bulk-import source that creates 3 e-mail addresses, 2 on the login domain, and 1 on another [domain attached](https://kb.apnscp.com/control-panel/creating-addon-domain/) to the account that is [authorized](https://kb.apnscp.com/e-mail/authorizing-hostnames-handle-e-mail/) to handle e-mail.

myadmin matt@apnscp.com sales matt, stan support@goap.is help, pager@att.net

Assuming the login domain is `example.com` and the primary domain is `example.com` then the following e-mail addresses are created with the following destinations:

1. myadmin@example.com forwards to matt@apnscp.com
2. sales@example.com forwards to matt@example.com, stan@example.com
3. support@goap.is forwards to help@example.com, pager@att.net
