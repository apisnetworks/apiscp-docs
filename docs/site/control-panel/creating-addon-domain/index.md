---
title: "Creating an addon domain"
date: "2015-03-17"
---

## Overview

An addon domain is a domain _in addition_ to your primary domain. Every package supports an unlimited number of addon domains, limited only by the amount of storage and bandwidth allotted to your account.

## Adding a new domain

A new domain may be added within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) under **DNS** > **Addon Domains**. There are a couple tunable parameters of interest. First is the _domain document root_, which indicates from where [site content](https://kb.apnscp.com/web-content/where-is-site-content-served-from/) for this new domain will be served.

**Domain Document Root**

**Site Root**

Serve from a directory within `/var/www`; in single-user scenarios this is optimal

**User Home**

Serve from a directory within a user [home directory](https://kb.apnscp.com/platform/home-directory-location/); this domain will be managed by a secondary user

**Subdomain**

Serve from a preexisting subdomain, this domain is aliased to the subdomain and vice-versa

Second, **_enable e-mail for this domain_**will authorize the server to handle mail for the domain. If you are using a third-party mail service, this option must be disabled to avoid [problems](https://kb.apnscp.com/e-mail/mail-sent-hosted-domain-not-arrive-third-party-mx-records/).

Once enabled, visit **Mail** > **Manage Mailboxes** to create new e-mail addresses for users on this domain. In certain situations, an e-mail address username may overlap. In these situations, it's prudent to use a [namespacing technique](https://kb.apnscp.com/e-mail/separating-mail-user-different-domain/) to separate e-mail delivery.

After adding the domain, ensure you have changed nameservers for the domain to our [nameservers](https://kb.apnscp.com/dns/nameserver-settings/). Nameserver settings are changed through the company through which you registered the domain. If you registered the domain through [our registrar](http://domains.apnscp.com), then this has been done for you already.

### Validating ownership

If a domain is already registered and already has nameserver records set to those other than [our nameservers](https://kb.apnscp.com/dns/nameserver-settings/), additional verification is necessary. This is to prevent unlawful hijacking of domains and mail routing that would otherwise be disastrous to clients on the same server. Complete 1 of 3 options available to verify that you are the owner.

\[caption id="attachment\_878" align="aligncenter" width="300"\][![Addon domain verification error that must be completed before a domain may be added to an account.](https://kb.apnscp.com/wp-content/uploads/2015/03/verification-dialog-300x91.png)](https://kb.apnscp.com/wp-content/uploads/2015/03/verification-dialog.png) Addon domain verification error that must be completed before a domain may be added to an account.\[/caption\]

**Important:** there are two caveats with regards to DNS that may take longer to complete verification if done _after_ attempting to add the domain as a consequence of how [DNS caching](https://kb.apnscp.com/dns/how-long-does-dns-propagation-take/) (TTL) works:

- **Remember**: uploading a verification file is always the fastest option to confirming ownership!
- Changing nameservers to our nameservers **_after attempting_** to add the domain will result in a 4-24 hour delay until changes are picked up in the control panel, because there was a positive DNS lookup and its cache duration is dictated by the SOA records present. These are typically higher than...
- `newacct` is looked up as a simple A record (IP address mapping). In most situations, unless your previous hosting provider has wildcard DNS setup, this record doesn't exist and will fail. A failed DNS lookup has a shorting cache duration (usually between 5-15 minutes). **Therefore**, validating with a `newacct` record **is preferred** over changing nameservers.

If for whatever reason none of these options may be completed, some registrars require DNS zone presence before permitting nameserver changes (_.br_ and _.ie_ country top-level domains "_ccTLDs"_), then open a ticket within the control panel. Explain your situation and we'll take care of adding your domain to a bypass list.
