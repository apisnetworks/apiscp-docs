---
title: "Let's Encrypt behind a reverse proxy"
date: "2017-09-12"
---

By default, apnscp will perform an IP check to ensure a hostname maps back to the configured IP address before issuing a certificate. This is true for both initial requests and automatic renewals. Automatic renewals occur 10 days before expiration. Both the panel and API allow you to circumvent this requirement.

**This does not bypass DNS propagation or domains that are unreachable via DNS.** This only affects hostnames that are behind a reverse proxy such as CloudFlare or SiteLock. A challenge must still be accessible from the domain, which points to a random location on the server. This is consistent with Let's Encrypt's ACME server that performs the mandatory check before issuing a certificate for each hostname.

## Issuance - Panel

Only certificate issues may be bypassed within apnscp. To bypass a DNS check on certificate issuance, disable the IP check option.

\[caption id="attachment\_1501" align="aligncenter" width="300"\][![](https://kb.apnscp.com/wp-content/uploads/2017/09/bypass-le-check-300x134.png)](https://kb.apnscp.com/wp-content/uploads/2017/09/bypass-le-check.png) Bypassing DNS check for Let's Encrypt within apnscp\[/caption\]

## Renewal - Beacon/API

The API must be used to renew Let's Encrypt certificates if DNS bypass checks are necessary. This may change in the future. [Beacon](https://kb.apnscp.com/control-panel/scripting-with-beacon/) provides a frontend to the API, and for the sake of simplicity, will be used in this discussion. After configuring Beacon, access [letsencrypt\_renew](http://api.apnscp.com/source-class-Letsencrypt_Module.html) and pass false to the optional _verifyip_ parameter. This will disable IP verification checks that cascade into [letsencrypt\_request](http://api.apnscp.com/source-class-Letsencrypt_Module.html).

beacon eval letsencrypt\_renew 0

Because the panel will **automatically renew** SSL certificates beginning **10 days before expiration**, this should be done every 60-80 days. If it fails, no email will be generated, so pay heed to the return value.

To simplify operation, add a scheduled task to run monthly or bimonthly within apnscp via **Dev** > **Task Scheduler**.
