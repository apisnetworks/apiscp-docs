# Apache

## suexec

* [Relax](https://github.com/apisnetworks/suexec) suexec policies, allow multi-user suEXEC usage

# SpamAssassin

## spamd

* chroot + break after processing


* source per-site rules in /etc/mail/spamassassin/prefs

## spamc

spamc.conf - up max message size from 500k to 1m

# Maildrop

* Accept \r\n and \n EOL markers

# PAM

Custom sshd, dovecot, smtp, vsftpd

# NSS

nsswitch.conf, add apnscpvwh to passwd



# Miscellaneous

## UW-IMAP

On high capacity servers, patch UW-IMAP with poll. Otherwise libc-client runs out of file descriptors.

[GitHub](https://github.com/apisnetworks/uw-imap-epoll/tree/master) *NOT BUNDLED WITH RELEASE*



 

#  