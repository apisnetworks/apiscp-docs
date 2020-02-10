# rspamd

rspamd can operate in a few flavors depending upon the number of servers you have, how much memory you can set aside, and whether you can trust the data fed into the system.

All commands use `cpcmd`  to interact with apnscp's API. All commands assume you're up-to-date with apnscp via `upcp`. After running the sequence of commands, run `upcp -b` to run [Bootstrapper](https://github.com/apisnetworks/apnscp-playbooks).

For the less attentive variety `cpcmd scope:set system.integrity-check 1` performs the same operation as `upcp -b` but sends an email digest to the [admin email](https://hq.apiscp.com/apnscp-3-0-beta-released/#bootstrapper-job-support) upon completion.

## Single-server scanning with local Redis

This is the default mode that unlocks all capabilities including greylisting, conversational whitelisting, fuzzy matches, user settings and neural learning.

```bash
cpcmd config_set apnscp.bootstrapper rspamd_enabled true
```

## Single-server scanning with centralized Redis

rspamd scanning will continue to operate on the current server, but all statistics are sent to a centralized database. This ostensibly confers the advantage of speeding up its learning process.

```bash
cpcmd config_set apnscp.bootstrapper rspamd_enabled true
cpcmd config_set apnscp.bootstrapper rspamd_redis_server redisserver:port
cpcmd config_set apnscp.bootstrapper rspamd_redis_password redispass
```

## Centralized scanning

A server can be designated to scan mail exclusively. Additional configuration should be taken to open the firewall ports and restrict trusted network traffic as well on the host machine.

```bash
cpcmd config_set apnscp.bootstrapper rspamd_enabled true
cpcmd config_set apnscp.bootstrapper rspamd_worker_socket somehost:someport
```

## Low memory without Redis

Setting `has_low_memory` will put apnscp into a miserly mode stripping many auxiliary features, including Redis (backend becomes SQLite), neural learning, conversational whitelisting, and greylisting.

```bash
cpcmd config_set apnscp.bootstrapper has_low_memory true
cpcmd config_set apnscp.bootstrapper rspamd_enabled true
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
cpcmd config_set apnscp.bootstrapper dovecot_learn_spam_folder '{{ dovecot_imap_root }}Trash'
```

::: v-pre
"{{ ... }}" is used for variable expansion in Bootstrapper and must be included. By default the IMAP prefix is "INBOX.".
:::
