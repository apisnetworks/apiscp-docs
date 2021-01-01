---
title: Courier Authlib
---

[Authlib](https://www.courier-mta.org/authlib/) is used by [Maildrop](LDA.md) to resolve email addresses to physical user accounts. Authlib depends upon PostgreSQL.

## User lookup

`authtest` performs a lookup request using `Authlib`, which is used for last-mile delivery by [Maildrop](LDA.md). `authtest` cannot test expansion of aliases, but can test delivery to physical users.

Consider a mail routing arrange like this:

| Email                 | Type          | Destination    |
| --------------------- | ------------- | -------------- |
| foo@domain.com        | user ("v")    | bar            |
| baz@domain.com        | user ("v")    | bar            |
| postmaster@domain.com | forward ("a") | foo@domain.com |

`authtest` will work for the first two lookups, but not last.

```bash
authtest foo@domain.com
# Authentication succeeded.
#     Authenticated: bar@domain.com  (uid 21015, gid 1000)
#    Home Directory: /home/bar/
#           Maildir: Mail/
#             Quota: (none)
#Encrypted Password: (none)
#Cleartext Password: (none)
#           Options: (none)

```

`getent` can be used to resolve the group ID ("gid") to its site storage.

```bash
getent group 1000
# Reports
# admin2:x:1000:
```

Now we know this delivers to the user bar under site2.

## Troubleshooting

### Logging

Log may be examined using `journalctl -u courier-authlib` or looking for `authdaemond` lines in `/var/log/maillog`.

### s_connect() deferments

Consider a situation in which mail cannot deliver.

```
Dec 23 14:34:19 delia postfix/pipe[5059]: 5CA13C0F12: to=<x@y.com>, relay=vmaildrop, delay=0.09, delays=0.06/0.01/0/0.02, dsn=4.3.0, status=deferred (temporary failure. Command output: ERR: authdaemon: s_connect() failed: Connection refused /usr/bin/maildrop: Temporary authentication failure. )
```

This indicates a communication problem with Authlib. maildrop connects to `/var/spool/authdaemon/socket.tmp`, which queries PostgreSQL for the auth data as in [User lookup](#user-lookup). Communication can fail when authlib processes are maxed out. Default value is 2. This can be raised to a higher value using `courier_workers`:

```bash
cpcmd scope:set cp.bootstrapper courier_workers 5
upcp -sb mail/configure-courier-authlib
```

### Temporary authentication failure deferments

Deferments of this type can occur when database credentials are invalid. Run `upcp -sb mail/configure-courier-authlib` in [Bootstrapper](Bootstrapper.md) to correct credentials.