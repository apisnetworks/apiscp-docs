---
title: "Achieving Inbox Zero"
date: "2014-11-03"
---

## Overview

[Inbox Zero](http://www.43folders.com/izero) is a rigorous approach to keep your inbox free of e-mail - or at least nearly empty. Any mail that is read will be migrated to an Archives IMAP folder after 5 minutes. Any mail that is starred in an e-mail client will, however, remain in the inbox until unstarred.

\[caption id="attachment\_156" align="alignnone" width="475"\][![Example of an e-mail that remains resident after starring in Thunderbird.](https://kb.apnscp.com/wp-content/uploads/2014/11/starred-test.png)](https://kb.apnscp.com/wp-content/uploads/2014/11/starred-test.png) Example of an e-mail that remains resident after starring (marking "important") in Thunderbird.\[/caption\]

## Solution

This can be achieved with a simple shell script that routinely runs every 5 minutes. Create a file named `inboxzero.sh` or simply download the script attached under _RESOURCES_. Upload this file to your home directory, then visit **Dev** >  **Scheduled Tasks** to setup a recurring task to run the script ([_terminal access required_](https://kb.apnscp.com/terminal/is-terminal-access-available/)). Specify `*/5` for _minute_, and `*` for all other time parameters. Under _Command_, specify `/bin/bash /home/user/inboxzero.sh` – replace `user` with your username.

#!/bin/sh
ARCHIVE=".Archives.$(date +%Y)"
MAIL="Mail/"
# Time, in minutes, to hold a read, unstarred e-mail
HOLD=5

\[\[ ! -d "$HOME/$MAIL/$ARCHIVE" && maildirmake "$HOME/$MAIL/$ARCHIVE" \]\]

find $HOME/$MAIL/cur -type f -cmin +$HOLD -mmin +$HOLD -regex '\[^:\]\*:\[^F\]\*$' -regex '\[^:\]\*:.\*S.\*$' -exec mv {} $HOME/$MAIL/$ARCHIVE/cur/ \\;

## Resources

[Download](https://kb.apnscp.com/wp-content/uploads/2014/11/inboxzero.zip) inbox-zero script.

> sha-256 sum: e64a95aabd47dfb5fff9d1b2ce9483fe9de2edf28875b27bd992bf5c327c8e61
> md5sum: f39fa0f67adda20d371758f5505b1bd5
