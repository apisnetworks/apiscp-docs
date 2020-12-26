---
title: SpamAssassin
---

[SpamAssassin](https://spamassassin.apache.org) is a mature and accurate spam filter built on Perl. For low volume usage, SpamAssassin is recommended over rspamd as it demonstrates high accuracy in low volume, homogeneous scenarios.

SpamAssassin can be enabled by setting `mail.spam-filter` to `spamassassin`.

```bash
cpcmd scope:set mail.spam-filter spamassassin
```

