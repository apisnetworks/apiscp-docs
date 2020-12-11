---
title: DNS
---

ApisCP ships with a variety of [DNS providers](https://github.com/search?q=topic%3Adns+org%3Aapisnetworks&type=Repositories) that allow for ApisCP to communicate directly with your service provider. DNS can be configured per-site or globally; in global configuration all sites that does not explicitly have a DNS provider configured will inherit the global setting.

## Providers

- null: dummy driver that always returns success
- builtin: use BIND or write a [surrogate](../PROGRAMMING.md#extending-modules-with-surrogates) module to override DNS behavior
- [powerdns](https://github.com/lithiumhosting/apnscp-powerdns): PowerDNS DNS
- [aws](https://github.com/apisnetworks/apiscp-dns-aws): Route53 (AWS) DNS
- [cloudflare](https://github.com/apisnetworks/apiscp-dns-cloudflare): Cloudflare DNS
- [digitalocean](https://github.com/apisnetworks/apiscp-dns-digitalocean): DigitalOcean DNS
- [hetzner](https://github.com/apisnetworks/apiscp-dns-hetzner): Hetzner DNS
- [katapult](https://github.com/apisnetworks/apiscp-dns-katapult): Katapult DNS
- [linode](https://github.com/apisnetworks/apiscp-dns-linode): Linode DNS
- [vultr](https://github.com/apisnetworks/apiscp-dns-vultr): Vultr DNS

Additional providers may be created by using any of the existing DNS providers as a template. Custom providers should be located in `lib/Opcenter/Dns/Providers` and `lib/Opcenter/Mail/Providers`.  Available providers may be enumerated as the admin,

`cpcmd dns_providers` and `cpcmd mail_providers`.

## Setting DNS defaults

`cpcmd` provides a simple method of setting global DNS defaults.

```bash
cpcmd scope:set dns.default-provider cloudflare
cpcmd scope:set dns.default-provider-key '[key:ABCDEF123,secret:AbCdEf12345,proxy:true]'
```

Note that all providers have different configuration requirements. Refer to the README.md bundled with each provider for more information. Provider documentation is also packaged with ApisCP in `lib/Opcenter/<Provider Type>/Providers/<Provider Name>` directory.

Account owners have permission to read this configuration directive from ApisCP's API. Do not set this value or defer setting it for any account you do not want to give admin access to view your DNS keys.

As an example,  an authenticated user can easily get the provider key from ApisCP's panel with a quick Javascript snippet: `apnscp.cmd("common_get_service_value", ["dns","key"], {async: false})`

## Setting DNS per account

Accounts may use a provider other than what is assigned globally. `dns`,`provider` and `dns`,`key` control these parameters.

::: danger
Any configuration set in this manner may be viewed by the Site Adminstrator. Do not store sensitive keys. In fact, PowerDNS is strongly recommended in multi-tenant environments, which stores authentication in an inaccessible location.
:::

```bash
EditDomain -c dns,provider=null -D somesite.com
```

Providers may also be configured within Nexus for the domain.

## Registering custom providers

**New in 3.2.16**

Providers may be registered outside the ApisCP distribution in `config/custom/` using `\Opcenter\Dns::registerProvider()`. Providers require both a **module** named `Module` and **validator** named `Validator`.

```bash
cd /usr/local/apnscp
git clone https://github.com/apisnetworks/apiscp-dns-cloudflare config/custom/cloudflare
sudo -u apnscp ./composer dumpautoload
```
Next register the provider module in `config/custom/boot.php`:

```php
<?php declare(strict_types=1);

\Opcenter\Dns::registerProvider('mymodule', Opcenter\Dns\Providers\Cloudflare\Module::class);
// namespace may also be registered instead of the module:
// \Opcenter\Dns::registerProvider('mymodule', 'Opcenter\Dns\Providers\Cloudflare');
```

Finally restart ApisCP backend for configuration to update:

```bash
systemctl restart apiscp
```

"mymodule" is now a registered DNS provider.

```bash
EditDomain -c dns,provider=mymodule -c dns,key='[key:cloudflaretoken]' domain.com
```

::: details Autoload registration
Astute readers will note that the full class path registered in boot.php didn't change. `dumpautoload` allows custom classes with the same name to override core panel classes.
:::

## DNS-only platform

ApisCP may also be configured in DNS-only mode, which disables all services and sets the default DNS provider to PowerDNS. This is helpful in clustering layouts. A DNS-only [license](../LICENSE.md) may be generated within [my.apiscp.com](https://my.apiscp.com) by selecting **DNS-only** from the license type dropdown.

Setting `has_dns_only=True` disables all non-essential services and converts the server into something suitable for a DNS cluster. DNS-only mode can be set at installation.

```bash
curl https://raw.githubusercontent.com/apisnetworks/apiscp-bootstrapper/master/bootstrap.sh | bash -s - -s use_robust_dns='true' -s has_dns_only='true' -s whitelist_ip='136.37.24.241'
```

Or set later using a [Scope](Scopes.md), then scrubbing the platform.

```bash
cpcmd scope:set cp.bootstrapper has_dns_only True
upcp -sb
```

See [PowerDNS](dns/PowerDNS.md) module documentation for further details.

## Troubleshooting

### dns:add_record_conditionally() fails due to duplicate entries
`dns:add-record-conditionally()` queries the configured module nameservers for a matching DNS record set using `dig`. If [PowerDNS](./dns/PowerDNS.md), these nameservers are read from `config/auth.yaml` and set by the `powerdns_nameservers` [Bootstrapper setting](Bootstrapper.md). For other DNS providers, this value is read from the respective API.

```bash
cpcmd -d domain.com dns:get-hosting-nameservers domain.com
# Reports ns1.domain.com, ns2.domain.com
dig +norec +aaonly +time=3 +tcp +short @ns1.domain.com TXT foo.domain.com
# Equivalent to the following commmand:
cpcmd -d domain.com dns:record-exists domain.com foo TXT
```