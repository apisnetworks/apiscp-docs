---
title: "Authorizing hostnames to handle e-mail"
date: "2015-03-17"
---

## Overview

A hostname, combination of optional subdomain and mandatory domain, may be configured to act as an e-mail domain, ie. receive e-mails on that host. These hostnames are added via **Mail** > **Mail Routing**. For any domain present there, the server will act as the final destination bypassing MX lookups. This will result in problems if you use [third-party](https://kb.apnscp.com/e-mail/mail-sent-hosted-domain-not-arrive-third-party-mx-records/) MX records.

The following is a brief list of composite examples:

**E-mail addresses for user _myuser_**

Subdomain

Domain

Hostname

Valid e-mail

Notes

mydomain.com

mydomain.com

myuser@mydomain.com

foo

mydomain.com

foo.mydomain.com

myuser@foo.mydomain.com

foo

"foo"

**Invalid**, non-[FQDN](http://en.wikipedia.org/wiki/Fully_qualified_domain_name)

myotherdomain.com

myuser@myotherdomain.com

myotherdomain.com

E-mail delivers to same inbox unless [namespaced](https://kb.apnscp.com/e-mail/separating-mail-user-different-domain/)

Once a hostname is authorized through Mail Routing, corresponding DNS entries are created and will be active so long as you use our [hosting nameservers](https://kb.apnscp.com/dns/nameserver-settings/).

### Third-party nameserver DNS

If you use third-party nameservers - nameservers [other than ours](https://kb.apnscp.com/dns/nameserver-settings/) - use the following DNS template to properly route mail once a hostname is added in Mail Routing:

<hostname>      IN MX 10 mail.<hostname>
mail.<hostname> IN A  <IP address>
