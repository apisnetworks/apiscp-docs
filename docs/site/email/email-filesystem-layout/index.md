---
title: "Email filesystem layout"
date: "2015-10-07"
---

## Overview

This article covers the raw storage structure of email on your account. All email is stored in a [Maildir](https://en.wikipedia.org/wiki/Maildir) format, which stores email in separate files in a directory named `Mail` within a user's [home directory](https://kb.apnscp.com/platform/home-directory-location/).

## Sample structure

_Directories in bold:_

.
├── **cur**
│   └── 1440231926.M975332P7880V05000DAI00000000000001D1\_0.sol.apnscp.com,S=1254:2,
├── dovecot-acl-list
├── dovecot.index
├── dovecot.index.cache
├── dovecot.index.log
├── dovecot-keywords
├── dovecot.mailbox.log
├── dovecot-uidlist
├── dovecot-uidvalidity
├── dovecot-uidvalidity.4cb493c8
├── **new**
├── **old** |-- **.Spam** | |-- **cur**
| |-- dovecot.index
| |-- dovecot.index.log
| |-- dovecot-keywords
| |-- dovecot-uidlist
| |-- **new**
| \`-- **tmp**
├── subscriptions
└── **tmp** 

### Component breakdown

- **Mail storage directories**: `new`, `cur`, and `tmp` `tmp` serves as a scratch directory for messages as they are written to disk. New messages are delivered to `new`, and once downloaded by a mail client, moved to `cur`.
- **Additional IMAP folders**: `.Spam` Any directory, prefix with a dot (".") is a separate IMAP folder. Each IMAP folder has its own set of mail storage directories (`new,` `cur`, `tmp`). IMAP folders may be virtually nested by separating each level with another dot. For example, take the following mailbox layout:
    
    INBOX
      |-- Billing
      |      |-- Bills
      |      |     \`-- Paid
      |      \`-- Orders
      \`-- Personal
    
    This is represented, on the server as a collection of directories in `Mail/` like this:
    
    .
    |-- .Billing
    |-- .Billing.Bills
    |-- .Billing.Bills.Paid
    |-- .Billing.Orders
    \`-- .Personal
    
- **Dovecot data**: `dovecot*` files: These are used internally by the IMAP/POP3 server ([Dovecot](http://www.dovecot.org)) to keep track of email. Of importance are cache files, ending in `.cache`, which may become corrupted if you exceed your storage usage, resulting in an [empty mailbox](https://kb.apnscp.com/e-mail/empty-mailbox/).
- **IMAP subscriptions**: `subscriptions` Subscriptions are all folders that appear once you login to an IMAP server. When a folder is subscribed to by an IMAP client, the folder name is written on a separate line. These are not used by POP3.
- **Email**: all files under `cur/` or `new/` Lastly, each file under these directories represents a single email. Each file consists of metadata embedded in its name.
    
    1440231926.M975332P7880V05000DAI00000000000001D1\_0.sol.apnscp.com,S=1254:2,S
      ^- delivery in unixtime  ^                       ^                     |       ^
                               \`- internal id          |                     |       |
                                                       \`- receiving hostname |       |
                                                                             \`- size |
                                                                                     \`- flags
    
    An email may be named anything; the filename provided above is a convention of our [hosting platform](https://kb.apnscp.com/platform/determining-platform-version/). An email may be named anything; these files will be reconciled to Dovecot's cache and treated as email  _if present in `cur/`_. In fact, during [server migrations](https://kb.apnscp.com/platform/migrating-another-server/), these email files are copied verbatim from the old server, which given the example above, will always have a completely different hostname in the filename. Still, these emails are accessible within any email client and display like any other email.
    
    Of interest, unixtime delivery is the date a message was delivered, so all files are presented chronologically. Flags, if specified, include specific IMAP commands, such as whether a message was relocated to trash ("T" flag), starred ("F" flag), or viewed ("S" flag). The latter two are used for our approach to [Inbox Zero](https://kb.apnscp.com/e-mail/achieving-inbox-zero/), which by the bye, is used religiously for support tickets.

### Migrating Email

As touched upon above in the email component breakdown, filenames are inconsequential and only provide a means to optimize IMAP access. Therefore, when migrating email from a previous hosting provider, email may be named anything, provided it is located within the `cur/` directory of the respective IMAP folder.

## See also

- KB: [POP3 vs IMAP Protocols](https://kb.apnscp.com/e-mail/pop3-vs-imap-e-mail-protocols/)
- Dovecot wiki: [Mailbox Format > Maildir](http://wiki2.dovecot.org/MailboxFormat/Maildir)
