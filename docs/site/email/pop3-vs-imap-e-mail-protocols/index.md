---
title: "POP3 vs IMAP e-mail protocols"
date: "2014-12-18"
---

## Overview

POP3 and IMAP are two separate protocols to access e-mail stored on the server. POP3 [originated first](https://www.ietf.org/rfc/rfc1939.txt) in 1996 and IMAP in [2003](https://tools.ietf.org/html/rfc3501). POP3 is designed for devices that have limited Internet connectivity and limited storage available on the mail server. POP3 is suitable for a dial-up connection or situations in which limited storage is available for e-mail. Thankfully, those days are long behind us.

IMAP evolved in conjunction with persistent online connections, like cable modems and DSL. IMAP keeps e-mail on the server and synchronizes its status (read, replied-to, forwarded, labels) with every e-mail client that accesses the server. This makes it suitable for access from phones and desktop mail clients: reading a message on your phone will synchronize its status with your desktop and vice-versa.

## Key differences

IMAP and POP3 are drastically different protocol implements. While they both access e-mail, IMAP and POP3 access mail with different behaviors as outlined:

IMAP

POP3

Mail storage

Mail resides on server

Mail resides on computer

Synchronization

Yes, mail is synchronized across all devices

No, mail is removed from server once accessed\*

Sent mail

Saved on server

Saved on desktop

Deleted mail

Sent to Trash folder, Trash must be "emptied" in mail client to free storage

Does not free storage; removed from desktop

Disaster Recovery

Yes, through Apis Networks

No

Access e-mail without Internet

No, requires Internet connection

Yes, does not require Internet connection

\* POP3 can be configured to leave mail on server once downloaded, this will result in duplication of mail across multiple platforms and is not recommended. Use IMAP in this instance.

## Which is right for me?

IMAP, unless you have limited Internet connectivity and must have access to e-mail at all times. In such extreme scenarios, then POP3 is a better choice.

## See also

- [Comparing Two Approaches to Remote Mailbox Access: IMAP vs. POP](ftp://ftp.cac.washington.edu/imap/imap.vs.pop.brief)
