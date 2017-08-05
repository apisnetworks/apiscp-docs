---
layout: docs
title: Introduction
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

The bootstrapper will install itself, as well as request a SSL certificate from Let's Encrypt (FCRDNS requirement). Once setup, a password will be generated. Your admin username is "admin" and password listed at the end.

## First Login

Visit https://\<domain\>:2083 to login to the panel as "admin". This is the **Administrator** account that can add, delete, and suspend accounts. **Site Administrators** are administrators of accounts created by an Administrator and are conferred all the rights of a **Secondary User**, with the added benefit of adding on domain, creating databases, and limited sudo. Further service configuration profiles may be setup in the following sections.

# Configuration
apnscp configuration is managed through `conf/` within its installation directory, `/usr/local/apnscp` by default. Two files require configuration before usage:
* database.yaml - cp, platform, and plugin database configuration
* auth.yaml - miscellaneous authentication providers

## Authentication Providers
apnscp uses a variety of third-party modules to enhance its presentation. The following providers are integrated and recommended that you setup an account with each to enhance your experience:
* Twilio: SMS notifications
* MaxMind: GeoIP location for unauthorized login notices
* PushOver: push notifications of server events to phone. Part of Argos.



## Initial Startup
apnscp will attempt to bootstrap SSL on first run using Let's Encrypt. To do this, the machine name must be reachable. Additional certificate names may be configured in conf/config.ini. Each time `additional_certs` is changed, remove the server SSL directory `data/ssl/account/MAIN` then restart apnscpd, `service apnscpd restart`. A new certificate will be fetched and installed within a couple minutes.

### Changing SSL Hostnames
Additional hostnames beyond the machine name (`uname -n`) can be configured by editing letsencrypt -> additional_certs in config.ini. To activate changes, remove the directory `vendor/data/acme-client/accounts/live/MAIN`, then restart apnscpd, `service apnscpd restart`.

### Adding Sites

Sites may be added using `AddDomain` or in simpler form, `add_site.sh`. Advanced usage of `AddDomain` is covered under **Managing Accounts**

# Logging In

apnscp may be accessed via https://<server>:2083/ or via http://<server>/ - an automatic redirect will occur in this situation. apnscp may be accessed from an addon domain through the /cpadmin alias.

### Important Terms

Before 

## Apache
### Fallback Interpreter
Apache runs as an ISAPI module embedded into PHP instead of PHP-FPM to reduce request latency and achieve higher throughput. Having only 1 interpreter limits legacy applications, but legacy applications should be shunned rather than shoehorned into a production environment. A secondary fallback interpreter, usually 1 or 2 versions lower is available on port 9000. 

* To enable fallback support for a given domain or site, use the apnscp command driver, cmd:
  `cmd -d <domain> php_enable_fallback`
* To disable fallback support, use disable_fallback:
  `cmd -d <domain> php_disable_fallback`

#### Configuring Fallbacks
Additional fallbacks may be configured by duplicating httpd-fallback-common.conf

# Customizing

See [Programming Guide]({% link development/programming-guide.md %}).

# License

Unless otherwise specified, all components of apnscp and its subcomponents are (c) 2017 Apis Networks. All rights reserved. For licensing inquiries, contact license@apisnetworks.com