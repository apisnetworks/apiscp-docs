---
title: "Sending mail from your account IP"
date: "2015-04-28"
---

## Overview

Accounts that purchase a separate IP address for SSL ($2.50/mo) may also, optionally, send outbound mail solely through that IP address. This feature is called **Private SMTP Routing**. Before doing so, please open a ticket within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/). Include which domains are sending outbound e-mail to ensure proper configuration. Only these domains specified in the ticket will connect to other mail servers using your assigned account IP address.

### Benefits

Sending mail from a separate IP address than other accounts on a server provide a few benefits:

**Immunity from DNS blacklists** All mail funnels through a set of IP addresses. In the event spam disseminates from one of these shared address, it can be blacklisted temporarily halting the flow of e-mail. By using an IP address unique to your account, all mail that flows from this IP address will be from your account only.

**Separate DNS reputation** Great if you send corporate e-mail, which is unlikely to trigger negative reputation heuristics with adaptive mail filter provides like Barracuda, GMail, and McAfee Threat Sense. Mail will continue to build a positive reputation with these providers ensuring mail is constantly delivered without incident.

### Downsides

**Lower volume, slower trust response** Sending mail from a single IP address that seldom sends mail can also have an profound adverse effect: not enough samples to establish neither a positive _nor_ negative reputation. Servers routinely send out 3,000 e-mails a day. The majority of which leave on a few IP addresses. Receiving mail servers can quickly establish a reputation based upon the volume of mail. Conversely, a single IP address sending 3-5 e-mails per day of "questionable" content may trigger a negative reputation filter.

### What should I do?

If you are a corporation or send several dozen e-mail per day, a separate IP allocation will ensure your mail goes through 24x7x365. On the other hand, if you send e-mail infrequently, and purchased an IP address allocated to your account, then don't do this. Continue to ride the coattails of the main IP address to ensure mail goes through without interruption.
