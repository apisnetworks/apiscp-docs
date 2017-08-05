---
layout: docs
title: Changes
group: misc
---


## Apache

### suexec

* [Relax](https://github.com/apisnetworks/suexec) suexec policies, allow multi-user suEXEC usage

## Passenger

* Specialized fork. [GitHub](https://github.com/apisnetworks/passenger)

## SpamAssassin

### spamd

* Jail + break after processing


* source per-site rules in /etc/mail/spamassassin/prefs

### spamc

spamc.conf - up max message size from 500k to 1m



## Courier 

### Authlib

* Jail + break

### Maildrop

- Accept \r\n and \n EOL markers
- Jail + break on processing

## Postfix

* Require authentication on all TCP-based submission in which the destination requires a relay. Origin TCP communications over 127.0.0.1 cannot log PID/UID.

## vsftpd

* Save login prior to PAM transformation for use with log reconcilement

## PAM

Custom sshd, dovecot, smtp, vsftpd

## NSS

nsswitch.conf, add apnscpvwh to passwd



## Miscellaneous

### UW-IMAP

On high capacity servers, patch UW-IMAP with poll. Otherwise libc-client runs out of file descriptors.

[GitHub](https://github.com/apisnetworks/uw-imap-epoll/tree/master) *NOT BUNDLED WITH RELEASE*
