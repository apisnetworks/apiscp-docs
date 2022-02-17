# rspamd

rspamd can operate in a few flavors depending upon the number of servers you have, how much memory you can set aside, and whether you can trust the data fed into the system.

All commands use `cpcmd`  to interact with ApisCP's API. All commands assume you're up-to-date with ApisCP via `upcp`. After running the sequence of commands, run `upcp -b` to run [Bootstrapper](Bootstrapper.md).

For the less attentive variety `cpcmd scope:set system.integrity-check 1` performs the same operation as `upcp -b` but sends an email digest to the [admin email](https://hq.apiscp.com/apnscp-3-0-beta-released/#bootstrapper-job-support) upon completion.

## Single-server scanning with local Redis

This is the default mode that unlocks all capabilities including greylisting, conversational whitelisting, fuzzy matches, user settings and neural learning.

```bash
cpcmd scope:set cp.bootstrapper rspamd_enabled true
```

## Centralized scanning

A server can be designated to scan mail exclusively. Additional configuration should be taken to open the firewall ports and restrict trusted network traffic as well on the host machine.

```bash
cpcmd scope:set cp.bootstrapper rspamd_enabled true
cpcmd scope:set cp.bootstrapper rspamd_worker_socket somehost:someport
```

## Local scanning with centralized Redis

**New in 3.2.32**

Servers may be configured to use a local Redis instance in standalone (default), offload processing to a central unit in "[centralized scanning](#centralized-scanning)" or process locally but store data in a single Redis instance.

To configure this behavior a few changes are necessary. Assume the rspamd Redis server runs on **1.2.3.4** and a client machine runs on **5.6.7.8**.

On server:

```bash
cpcmd scope:set cp.bootstrapper rspamd_redis_custom_config '[bind:"*",port:6780]'
PASSWORD="$(openssl rand -base64 32)"
cpcmd scope:set cp.bootstrapper rspamd_redis_password "$PASSWORD"
upcp -sb mail/rspamd
```
Grab the Redis password from the master:

```bash
# Whitelist client machine
cpcmd scope:set rampart:whitelist 5.6.7.8
# Get password
cpcmd scope:get cp.bootstrapper rspamd_redis_password
```

Next, on the client, reconfigure it to send results to 1.2.3.4.
```bash
cpcmd scope:set cp.bootstrapper rspamd_redis_server "1.2.3.4"
cpcmd scope:set cp.bootstrapper rspamd_redis_password "PASSWORD-FROM-ABOVE-COMMAND"
upcp -sb mail/rspamd
```

ApisCP will attempt to detect if the Redis IP is local or remote. If ApisCP cannot properly detect this, it may be forced by setting `rspamd_redis_local` to `True` or `False`.


## Low memory without Redis

Setting `has_low_memory` will put ApisCP  into a miserly mode stripping many auxiliary features, including Redis (backend becomes SQLite), neural learning, conversational whitelisting, and greylisting.

```bash
cpcmd scope:set cp.bootstrapper has_low_memory true
cpcmd scope:set cp.bootstrapper rspamd_enabled true
```

## Training rspamd

By default rspamd piggybacks SpamAssassin. Depending upon mail volume this may take a few hours to a few weeks to develop a healthy model. You can jumpstart this by feeding your existing mail or by using readily available corpuses... corpii... [Corp Por](https://uo.stratics.com/content/basics/spells_archive.shtml)?

`rspamc learn_ham` and `rspamc learn_spam` will snarf the mailboxes it's fed learning all messages as ham (non-spam) or spam respectively.

### Corpus list

- [Enron corpus](https://www.cs.cmu.edu/~./enron/) (ham)
- [Enron spam corpus](http://nlp.cs.aueb.gr/software_and_datasets/Enron-Spam/index.html) (spam)

### Mailbox method

apnscp supports automatic learning by dragging email into and out of your "Spam" IMAP folder. Mail dragged out is automatically learned as ham. Mail dragged in is learned as spam. By default the Trash folder *is not* used to designate spam as some users have a tendency to delete read messages; this would greatly pollute its learned data.

You can enable learning mail sent to Trash as spam with the following:

```bash
cpcmd scope:set cp.bootstrapper dovecot_learn_spam_folder '{{ dovecot_imap_root }}Trash'
```

::: details Jinja templates
::: v-pre
"{{ ... }}" is a Jinja construct used for denote variable expansion in Bootstrapper and must be included. By default the IMAP prefix is "INBOX.".
:::

## DKIM signing
**New in 3.2.20**

DKIM provides envelope and sender integrity by supplying a cryptographic fingerprint of the message that is easy to verify but difficult to reproduce without knowing the private key. DKIM works similarly to SSL/TLS used to encrypt web traffic.

![DKIM process](./images/dkim-overview.svg)

Two components are required for DKIM:
- valid DNS TXT record named as `<SELECTOR>._domainkey`
- `DKIM-Signature` header that stores a signature of one or more headers in their original form

A **selector** may be any alphanumeric sequence of at least 1 and fewer than 16 characters. Selector names are encoded in `DKIM-Signature` as the `s=` parameter. A default selector named `dkim` is used. A new selector may be created using `dkim:roll($selector = null)` *omitting selector adds a digit to the selector name*. Rolling a selector creates a new selector, but does not delete the previous selector. This previous selector may be expired (deleted from DNS) using `dkim:expire($selector)`. 

Selectors should be rotated periodically - every 6 months at most and previous selectors should be expired after 7 days.

DKIM requires rspamd, which can work cooperatively with [SpamAssassin](SpamAssassin.md) or independently.

```bash
# Switch exclusively to rspamd
cpcmd scope:set mail.spam-filter rspamd
# or enable rspamd in piggyback mode
cpcmd scope:set mail.rspamd-piggyback true
```

Next, enable DKIM signing. Once DKIM is configured for the server, setup a DKIM key for all participating sites using `dkim:roll`.

```bash
cpcmd scope:set mail.dkim-signing true
sleep 5
# Wait for ansible-playbook to complete
while pgrep -f ansible-playbook ; do sleep 1 ; done
# Enabling debug shows batch operation
env DEBUG=1 cpcmd dkim:roll DKIM2021
```
A new key will be created under `/var/lib/rspamd/dkim/global.DKIM2021.key`. To note, `global` is the domain name (special usage) and `DKIM2021` selector name.

::: tip Bulk DNS modifications
DNS records may be updated en masse, such as DMARC updates, using a simple PHP script. See [Bulk record management](DNS.md#bulk-record-management) in DNS.md.
:::