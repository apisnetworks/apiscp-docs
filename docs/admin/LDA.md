---
title: Mail delivery (maildrop)
---

Local delivery agent ("LDA") handles last mile delivery of mail locally to the server. maildrop is utilized as the LDA agent for [Postfix](Smtp.md). maildrop was chosen for syntactic familiarity with other services, but a message may be easily dispatched to another service for final delivery.

## Delivery pipeline

Message filtering is done prior to delivery via maildrop. Each message goes through two levels of filters: (1) global — processed first in `/etc/maildroprc` followed by (2) local per-user filters in `$HOME/.mailfilter`. Basic filtering recipes are provided below. Syntax and usage may be found under [Mail filtering](https://kb.hostineer.com/guides/mail-filtering/) in the Hostineer Knowledge Base.

Depending upon spam filtering technology, there may be a separate "xfilter" call for external message filtering. rspamd filters before enqueueing a message whereas SpamAssassin occurs *after* enqueueing the message.

### SpamAssassin

SpamAssassin is invoked from the global maildrop filter, `/etc/maildroprc`. The following block of code passes the message off to SpamAssassin if it is smaller than 512 KB.

```maildrop
if ($SIZE < 524288)
{
        xfilter "/usr/bin/spamc -u $RECIPIENT"
}
```

These 4 lines are required for a message to be filtered through SpamAssassin. Removal of these lines from `/etc/maildroprc` will cause mail to be delivered unfiltered. Further, the linebreaks are critical. Opening and closing braces **must** be on their own lines. [K&R/KNF style braces](http://en.wikipedia.org/wiki/Indent_style#BSD_KNF_style) **do not** work. Likewise, ensure line endings are correct (previous warning).

### rspamd

Filtering occurs at SMTP connection time. Any maildrop rules applied are applied after scoring has been established.

## Default maildrop filter

/etc/maildroprc

```maildrop
# Global maildrop rules go here
# See http://www.courier-mta.org/maildrop/maildropfilter.html for syntax
if ($SIZE < 524288)
{
        exception {
                xfilter "/usr/bin/spamc -u $RECIPIENT"
        }
}

DELETE_THRESHOLD=10.0
if (/^X-Spam-Flag: YES/)
{
        /X-Spam-Score: (\d+)/
        if ($MATCH1 >= $DELETE_THRESHOLD)
        {
                to /dev/null
        }
        else
        {
                to Mail/.Spam/
        }
}
```

**Explanation:** if the message size is smaller than 512 KB, hand it off to SpamAssassin. `DELETE_THRESHOLD` is the maximum score an e-mail may have *if and only if* it is labeled as spam. If the score is greater or equal to `DELETE_THRESHOLD`, then the message will be deleted by being sent to `/dev/null` otherwise deliver to the Spam mailbox on the server.

## SpamAssassin-specific filtering

The following rules only apply if the spam filter is SpamAssassin. `mail.spam-filter` is a [Scope](Scopes.md) that allows you to change between rspamd and SpamAssassin.

### Globally disabling per-user filter files

Adding `to $DEFAULT` at the end of the global filtering file will deliver the message to the default mailbox, `$HOME/Mail`, and cease further processing.

### Selectively disabling per-user filtering

`LOGNAME` holds the current username on the server. A simple check can be used to prohibit user filtering for a specific user.

/etc/maildroprc

```maildrop
if ($SIZE < 524288)
{
        xfilter "/usr/bin/spamc -u $RECIPIENT"
}
# User "bill" loves his spam
if ($LOGNAME ne "bill" && /^X-Spam-Flag: YES/)
{
        to /dev/null
}
```

Likewise to disable checking the filter file for a user, the above recipe can be further modified…

```maildrop
if ($SIZE < 524288)
{
        xfilter "/usr/bin/spamc -u $RECIPIENT"
}
# User "bill" loves his spam
if ($LOGNAME ne "bill" && /^X-Spam-Flag: YES/)
{
        to /dev/null
}
# But he's prohibited from adding any filter rules
if ($LOGNAME eq "bill")
{
        to $DEFAULT
}
```

Note that eq, lt, le, gt, ge, ne are used for string comparisons, while ==, <, <=, >, >=, != are used for numeric comparisons.

### Using a single SpamAssassin instance

One user account may be delegated to handle all SpamAssassin filtering settings for all e-mail accounts. Replace the e-mail-specific variable, `$RECIPIENT` with the full user’s login`/etc/maildroprc`. For example, to let the user named example on the domain example.com handle spam filtering for all users on the domain example.com:

File:`/etc/maildroprc`

```maildrop
# Global maildrop rules go here
# See http://www.courier-mta.org/maildrop/maildropfilter.html for syntax
if ($SIZE < 131072)
{
        exception {
                xfilter "/usr/bin/spamc -u example@example.com"
        }
}
# rest of the rules ...
```

**Pros**

- Jumpstart filtering: newly-added users will have robust spam/ham information already in place to immediately increase the effectiveness of spam filtering
- Low volume benefits from high volume: e-mail accounts that receive few e-mails will already have [SpamAssassin’s Bayesian classifier system](http://wiki.apache.org/spamassassin/BayesInSpamAssassin) activated. Bayes scores add anywhere between -2 to 3 points per message depending upon how certain SpamAssassin is of its validity. Those points are generally enough to correctly rank a false positive as a true positive.

**Cons**

- Privacy issues: bits of e-mail used by SpamAssassin may be viewable by the main user
- Dilution: SpamAssassin has a finite storage capacity of tokens from scanned messages. These special tokens may appear more readily in spam or non-spam. Introducing a high variability among several users may reduce SpamAssassin’s effectiveness as the token counts are removed to store new tokens.

## General spam filtering

The following rules work for both rspamd and SpamAssassin.

### Deleting all messages marked spam

Before the recipe is given bear in mind this is strongly discouraged for two reasons, (1) young e-mail accounts may have a lot of variability in scoring and (2) no failure notice is generated. Consequently, neither the sender nor you will know if the message had been deleted, because no delivery failure status is generated. This is very similar to the default maildroprc, except threshold scoring is removed and all spam is deleted.

```maildrop
if (/^X-Spam-Flag: YES/)
{
    to /dev/null
}
```

### Filtering to an external program

maildrop’s [xfilter](https://kb.hostineer.com/guides/mail-filtering/) directive pipes the message to an external script for processing. A rudimentary example reverses the message text. Naturally, as this is a shell script it should be directly executable from the shell, so ensure the permissions are at least 700 (`chmod 700 reverse.sh`).

```maildrop
# .mailfilter
xfilter "$HOME/reverse.sh"
reverse.sh
```

```bash
#!/bin/sh
exec 6<&0
while read -u 6 line ;
do
        echo $line | rev
done
exec 6<&-
exit 0
```

### Creating a spam trap

Spam traps are useful addresses deliberately listed on Web pages hidden from public view. Spam bots harvest these addresses and deliver spam. You can use this knowledge to feed all e-mail destined to a particular address directly to SpamAssassin with the `to` directive. In addition to delivering to mailboxes, `to` can forward outbound to another address (!) or to another program (|) with a simple prefix. The following assumes `spam@mydomain.com` maps to a virtual mailbox on the server owned by the user `myuser`

| Username | Domain       | Destination       | Type |
| :------- | :----------- | :---------------- | :--- |
| spam     | mydomain.com | /home/myuser/Mail | V    |
| myuser   | mydomain.com | /home/myuser/Mail | V    |

And for the recipe

```maildrop
if (hasaddr("spam@mydomain.com"))
{
to "|/usr/bin/spamc --spam -u $RECIPIENT"
}
```

Aliasing a spam trap to the local address "learn_spam" is a better approach and works with both SpamAssassin and rspamd.

## Forwarding

Edit the file named `.mailfilter` within the user’s home directory and add:

```maildrop
to "!user@mydomain.com"
```

If you would like to forward *and* store a copy of the message on the server, then use the `cc` directive to maildrop:

```maildrop
cc "!user@mydomain.com"
```

## Troubleshooting

### Mailbot ignores DSN auto-replies

#### Background

Mailbot, which is responsible for handling auto-replies in the vacation module of apnscp will not generate a response for certain messages. Mailbot is designed to ignore [delivery status notification](https://en.wikipedia.org/wiki/Bounce_message) emails in [check_dsn()](https://github.com/svarshavchik/courier-libs/blob/master/maildrop/mailbot.c) that contain an "Auto-Submitted" header.

#### Solution

No workaround exists. It is recommended for email that requires an auto-response if a user is away to not include an "Auto-Submitted" DSN header.

### Tracing delivery behavior

#### Background
Mail may appear to be stuck in Postfix's queue due to an underlying delivery problem. [strace](http://man7.org/linux/man-pages/man1/strace.1.html) or any low-level trace utility can be used to peek into delivery of a message.

#### Solution
Use postcat in conjunction with maildrop to simulate delivery to an intended recipient. For example, list the email queue:

```bash
postqueue -p
```

```
-Queue ID-  --Size-- ----Arrival Time---- -Sender/Recipient-------
E41B4EC52E      529 Fri Jan  4 13:35:11  srs0=ustn=pm=testing.apisnetworks.com=root@apisnetworks.com
(temporary failure. Command output: /usr/bin/maildrop: Unable to open mailbox.)
                                         apisnetworks@apisnetworks.test

-- 0 Kbytes in 1 Request.
```

Then use postcat to reconstruct its envelope:
```bash
postcat -hbq E41B4EC52E
```

And pipe to maildrop, the LDA for ApisCP:
```bash
postcat -hbq E41B4EC52E | maildrop -d apisnetworks@apisnetworks.test
```
Where apisnetworks@apisnetworks.test maps to a user account named apisnetworks on domain apisnetworks.test.

Fully composed such a command may look similar to:
```bash
postcat -hbq E41B4EC52E | strace -s 1024 -f -- maildrop -d apisnetworks@apisnetworks.test
```

