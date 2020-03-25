---
title: "Unable to send e-mail"
date: "2015-01-07"
---

## Overview

Client is able to receive e-mail, but not send. If client is unable to both send and receive e-mail, then refer to [Accessing e-mail](https://kb.apnscp.com/e-mail/accessing-e-mail/) for proper login details. Note, this does not affect [webmail](https://kb.apnscp.com/e-mail/accessing-e-mail/#webmail). Only desktop/handheld mail clients apply.

## Causes

### Firewall restriction on port 25

ISPs commonly implement firewall blocks upstream on port 25 to reduce the amount of spam emitted from its network by compromised computers. If you are unable to send through port 25, then change your SMTP port to 587 within your respective e-mail client.

### Local firewall restrictions

Certain software, such at Norton Internet Security and AVG may, in certain configurations, restrict communication to the SMTP server. If using such software, refer to its help documentation for further assistance.

### E-mail returns with Relay access denied

E-mail client did not enable outgoing e-mail authentication with the mail server. This is absolutely necessary to ensure that only hosting accounts may send mail through the server (and not random machines across the globe). See [Accessing e-mail](https://kb.apnscp.com/e-mail/accessing-e-mail/).

**Invalid login/password**

Verify user can send outgoing e-mail through the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) under **User** > **Manage Users** > _**Edit**_action beneath the _Actions_ column. Under **General Service Configuration** > **E-Mail** > **_Advanced_**, verify that _User may send e-mail through server_ is checked. If checked, verify [login information](https://kb.apnscp.com/e-mail/accessing-e-mail/) is correct. Lastly, reset password.

\[caption id="attachment\_406" align="alignnone" width="300"\][![Confirmation dialog that SMTP is enabled via Manage Users.](https://kb.apnscp.com/wp-content/uploads/2015/01/smtp-enabled-300x157.png)](https://kb.apnscp.com/wp-content/uploads/2015/01/smtp-enabled.png) Confirmation dialog that SMTP is enabled via Manage Users.\[/caption\]
