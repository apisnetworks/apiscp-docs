---
title: DNS
---

# Configuring DNS

apnscp ships with a variety of [DNS providers](https://github.com/search?q=topic%3Adns+org%3Aapisnetworks&type=Repositories) that allow for apnscp to communicate directly with your service provider. DNS can be configured per-site or globally; in global configuration all sites that does not explicitly have a DNS provider configured will inherit the global setting.

**Providers**

- null: dummy driver that always returns success
- builtin: use BIND or write a [surrogate](https://docs.apiscp.com/development/programming-guide/#extending-modules-with-surrogates) module to override DNS behavior
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
cpcmd config_set dns.default-provider cloudflare
cpcmd config_set dns.default-provider-key '[key:ABCDEF123,secret:AbCdEf12345,proxy:true]'
```

Note that all providers have different configuration requirements. Refer to the README.md bundled with each provider for more information. Provider documentation is also packaged with apnscp in `lib/Opcenter/<Provider Type>/Providers/<Provider Name>` directory.

Account owners have permission to read this configuration directive from apnscp's API. Do not set this value or defer setting it for any account you do not want to give admin access to view your DNS keys.

As an example,  an authenticated user can easily get the provider key from apnscp's panel with a quick Javascript snippet: `apnscp.cmd("common_get_service_value", ["dns","key"], {async: false})`

## Assigning providers per account

Accounts may use a provider other than what is assigned globally. `dns`,`provider` and `dns`,`key` control these parameters.

```bash
EditDomain -c dns,provider=null -D somesite.com
```

Providers may also be configured within Nexus for the domain.