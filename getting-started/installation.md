---
layout: docs
title: Installation
group: getting-started
---
* ToC
{:toc} 

# Features

apnscp works best with at least 2 GB for services + caching. Additional features may be installed:

{: .table .table-striped}
| Service  | ?           | Bottleneck  | Description                              |
| -------- | ----------- | ----------- | ---------------------------------------- |
| apnscp   | Required    | -           | Control panel frontend/backend           |
| mcache   | Recommended | Memory      | PHP opcode + session in-memory           |
| vscanner | Optional    | CPU         | Real-time upload filtering, well-known URI lockdown |
| mscanner | Optional    | Memory, CPU | Mail scanning, aggregate Bayesian DB     |
| rampart  | Recommended | CPU         | Real-time brute-force deterrent, DoS filtering |
| argos    | Recommended | CPU         | Monit monitoring profiles + push notification |


## Proactive and Reactive Monitoring

Argos is a configured Monit instance designed to afford both proactive and reactive monitoring. Rampart provides a denial-of-service sieve for reducing resource swells from misbehaving bots. apnscp includes disallowance of HTTP/1.0 protocol, by default, to reduce malware. All components work to keep your sites more secure by filtering out garbage. [tuned](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/6/html/Power_Management_Guide/Tuned.html) works proactively by retuning system variables as necessary. apnscp ships with the `virtual-guest` profile active.

# Installation

apnscp may be installed from the bootstrap utility. Once installed a 15-day trial begins. A license key may be purchased through [apnscp.com](https://apnscp.com). 

Before installing, ensure the following conditions are met:

- [] 1 GB RAM (2 GB recommended)
- [] [Forward-confirmed reverse DNS](https://en.wikipedia.org/wiki/Forward-confirmed_reverse_DNS), i.e. 64.22.68.1 <-> apnscp.com
- [] CentOS 7.x or RedHat 7.x

## Bootstrapping apnscp

Run the command from terminal

```shell
wget -O - {{ site.bootstrap_url }} | bash
```

The bootstrapper will install itself, as well as request a SSL certificate from Let's Encrypt's staging environment. Once setup, a password will be generated. Your admin username is "admin" and password listed at the end.

{% callout info %}
apnscp will initially request a certificate from Let's Encrypt staging environment. If your forward-confirmed reverse DNS is correct, copy `config/config.ini` to `config/custom/` and change **[letsencrypt]** => **debug** to false, then restart apnscpd, `systemctl apnscpd restart`. apnscp will request a new certificate from Let's Encrypt's production server. Remember that Let's Encrypt limits requests to [20 requests/week](https://letsencrypt.org/docs/rate-limits/), so make sure your DNS is properly setup before disabling debug mode.
{% callout info %}

## First Login

Visit https://\<domain\>:2083 to login to the panel as "admin". Accept the untrusted certificate if generated under debug mode. You can fix this later as noted in [Bootstrapping apnscp](#bootstrapping-apnscp).

This is the **Administrator** account that can add, delete, and suspend accounts. **Site Administrators** are administrators of accounts created by an Administrator and are conferred all the rights of a **Secondary User**, with the added benefit of adding on domain, creating databases, and limited sudo. Further service configuration profiles may be setup in the following sections.