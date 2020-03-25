---
title: "Empty mailbox"
date: "2014-11-13"
---

## Overview

Whenever a user exceeds his or her storage, an e-mail client may report zero e-mails present despite there actually being mail in the mailbox.

## Cause

The mail server, Dovecot, uses a few cache files to speed up mailbox access on your account. In certain circumstances, these caches can become corrupted due to lack of storage. Consequently, whenever the cache is accessed by Dovecot, it returns incomplete information about your mailbox that is rendered as an empty mailbox.

## Solution

1. Login to the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/)
2. Ensure the user has sufficient storage available via **User** >  **Manage Users**
    - If not, edit the storage limit for the user via the **Edit** action under _Actions_
3. Under **Files** > **File Manager**, navigate to the user's home directory
    - This directory will be named as /home/_<user>_ where _<user>_ is the user whose mailbox is corrupted
4. Navigate to the `Mail/` folder
5. Delete files `dovecot.index`, `dovecot.index.log`, and `dovecot.index.cache`
6. Access e-mail again. Problem is resolved.
