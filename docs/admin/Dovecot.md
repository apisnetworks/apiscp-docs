---
title: Dovecot
---

Dovecot is a combined IMAP, POP3, LDA, and sieve platform. ApisCP uses Dovecot for its IMAP and POP3 features with limited sieve support for training mail on IMAP folder transfer.

Dovecot may be enabled or disabled using the `mail.enabled` [Scope](Scopes.md).

```bash
cpcmd scope:set mail.enabled true
```

## Access

IMAP and POP3 access is governed by PAM. listfile authorization in siteXX/fst/etc/<SERVICE\>.pamlist requires that the named user to be listed to permit access. A user **must be listed** in its respective service file, i.e. `imap.pamlist` and `pop3.pamlist`.

Passwords are sourced from siteXX/fst/etc/shadow as with all services. When SSL is enabled for an account, use port 993 or 995 for IMAPS/POP3S respectively. Any domain attached to an SSL certificate may be used as the mail server name. See [Accessing e-mail](https://kb.apnscp.com/email/accessing-e-mail/) in the client KB.

## Enabling compression

Dovecot supports reading compressed mail by default. Dovecot can additionally be configured to compress mail it generates, such as sent messages by setting `dovecot_enable_zlib_storage=true`.

```bash
cpcmd scope:set cp.bootstrapper dovecot_enable_zlib_storage=true
upcp -sb mail/configure-dovecot
```

Note, in doing so, it is no longer possible for `sa-learn` or `rspamc` to read these messages without decompressing. Moreover, [maildrop](LDA.md) does not perform compression prior to delivery. A separate filter rule to compress mail on delivery can be added to [siteXX/fst/etc/maildrop](CONVENTIONS.md) as well as `FILESYSTEMTEMPLATE/siteinfo/etc/maildroprc` with the following rule:

```
xfilter "gzip -c"
```

## Training email

Removing messages from the **Spam** folder automatically learns as ham (non-spam). Sending messages to the **Spam** folder automatically learns as spam. These mailbox names may be reconfigured using `dovecot_learn_spam_folder` and `dovecot_learn_ham_folder`.

```bash
# Messages removed from this folder are learned as ham
cpcmd scope:set cp.bootstrapper dovecot_learn_ham_folder "{{ dovecot_imap_root }}Trash"
# Messages moved into this folder are learned as spam
cpcmd scope:set cp.bootstrapper dovecot_learn_spam_folder "{{ dovecot_imap_root}}Trash"
# Rebuild configuration
upcp -sb mail/configure-dovecot
```

 `{{ dovecot_imap_root }}` is required when setting either variable. It corresponds to the IMAP default namespace, `INBOX.`.