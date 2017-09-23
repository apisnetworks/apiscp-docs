---
layout: docs
title: Configuration
group: getting-started
---
* ToC
{:toc} 

apnscp configuration is managed through `config/` within its installation directory, `/usr/local/apnscp` by default. Two files require configuration before usage:
* database.yaml - cp, platform, and plugin database configuration
* auth.yaml - miscellaneous authentication providers

## Authentication Providers
apnscp uses a variety of third-party modules to enhance its presentation. The following providers are integrated and recommended that you setup an account with each to enhance your experience:
* Twilio: SMS notifications
* MaxMind: GeoIP location for unauthorized login notices
* PushOver: push notifications of server events to phone. Part of Argos.

## Initial Startup
apnscp will attempt to bootstrap SSL on first run using Let's Encrypt. To do this, the machine name must be reachable. Additional certificate names may be configured in conf/config.ini. Each time `additional_certs` is changed, remove the server SSL directory `data/ssl/account/MAIN` then restart apnscpd, `systemctl restart apnscpd`. A new certificate will be fetched and installed within a couple minutes.

### Changing SSL Hostnames
Additional hostnames beyond the machine name (`uname -n`) can be configured by editing **[letsencrypt]** -> **additional_certs** in `config/config.ini`. To activate changes, remove the directory `vendor/data/acme-client/accounts/live/MAIN`, then restart apnscpd, `service apnscpd restart`.

### Adding Sites
Sites may be added using `AddDomain` or in simpler form, `add_site.sh`. Advanced usage of `AddDomain` is covered under [Managing Accounts]({%link admin/managing-accounts.md %}).

# Logging In

apnscp may be accessed via https://\<server\>:2083, http://\<server\>:2082, or via http://\<server\>/ - an automatic redirect to https://\<server\>:2083 will occur in this situation. apnscp may be accessed from an addon domain through the /cpadmin alias.

# Customizing

* API Programming: [Programming Guide]({% link development/programming-guide.md %})
* Theming/CSS: [apnscp-bootstrap-sdk](https://github.com/apisnetworks/apnscp-bootstrap-sdk) on Github

## Configuration

apnscp contains several tunables in `config/config.ini`. These are system defaults. To make changes, copy `config.ini` to `config/custom/config.ini` and edit that file. Once changes have been made, restart apnscp to activate changes.

```bash
cp config/config.ini config/custom/config.ini
# Now make changes...
vim config/custom/config.ini
# Restart apnscpd to activate changes
systemctl restart apnscp
```