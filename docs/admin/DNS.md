---
title: DNS
---

ApisCP ships with a variety of [DNS providers](https://github.com/search?q=topic%3Adns+org%3Aapisnetworks&type=Repositories) that allow for ApisCP to communicate directly with your service provider. DNS can be configured per-site or globally; in global configuration all sites that does not explicitly have a DNS provider configured will inherit the global setting.

## Providers

- null: dummy driver that always returns success
- builtin: use BIND or write a [surrogate](../PROGRAMMING.md#extending-modules-with-surrogates) module to override DNS behavior
- [powerdns](https://github.com/lithiumhosting/apnscp-powerdns): PowerDNS DNS
- [aws](https://github.com/apisnetworks/apnscp-dns-aws): Route53 (AWS) DNS
- [cloudflare](https://github.com/apisnetworks/apnscp-dns-cloudflare): Cloudflare DNS
- [digitalocean](https://github.com/apisnetworks/apnscp-dns-digitalocean): DigitalOcean DNS
- [linode](https://github.com/apisnetworks/apnscp-dns-linode): Linode DNS
- [vultr](https://github.com/apisnetworks/apnscp-dns-vultr): Vultr DNS

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