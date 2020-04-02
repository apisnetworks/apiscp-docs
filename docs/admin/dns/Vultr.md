# Vultr DNS Provider

This is a drop-in provider for [apnscp](https://apnscp.com) to enable DNS support for accounts that use Vultr. This provider is built into apnscp.

## Configuring

```bash
EditDomain -c dns,provider=vultr-c dns,key=abcdef1234567890 domain.com
```

Where the key is created within Vultr. Your API key is available within your [Member's Area](https://my.vultr.com/settings/#settingsapi).

### Whitelisting IP access
Vultr uses an IP whitelist to restrict API usage. Within the Member's Area, go to **Account** > **API** > **Access Control**. Add the IPv4 address or if IPv4 access is disabled on the machine, IPv6 to the list of authorized subnets.

To get the remote IPv4, run the following command from your server:
```bash
dig +short myip.opendns.com @resolver1.opendns.com
```

To get the remote IPv6, run the following command from your server:
```bash
dig +short -6 myip.opendns.com aaaa @resolver1.ipv6-sandbox.opendns.com
```

Leave the subnet mask (/32) as-is. This is part of CIDR notation to expand the matching range.

### Setting as default

Vultr may be configured as the default provider for all sites using the `dns.default-provider` [Scope](https://gitlab.com/apisnetworks/apnscp/blob/master/docs/admin/Scopes.md). When adding a site in Nexus or [AddDomain](https://hq.apnscp.com/working-with-cli-helpers/#adddomain) the key will be replaced with "DEFAULT". This is substituted automatically on account creation.

```bash
cpcmd config_set dns.default-provider vultr
cpcmd config_set dns.default-provider-key '[key:ABCDEF123,secret:abCdEf12345]'
```

> Note that it is not safe to set this value as a server-wide default in untrusted multiuser environments. A user with panel access can retrieve your key `common_get_service_value dns key` or even using Javascript in the panel, `apnscp.cmd('common_get_service_value',['dns','key'], {async: false})`.

## Components

* Module- overrides [Dns_Module](https://github.com/apisnetworks/apnscp-modules/blob/master/modules/dns.php) behavior
* Validator- service validator, checks input with AddDomain/EditDomain helpers

### Minimal module methods

All module methods can be overwritten. The following are the bare minimum that are overwritten for this DNS provider to work:

- `atomicUpdate()` attempts a record modification, which must retain the original record if it fails
- `zoneAxfr()` returns all DNS records
- `add_record()` add a DNS record
- `remove_record()` removes a DNS record
- `get_hosting_nameservers()` returns nameservers for the DNS provider
- `add_zone_backend()` creates DNS zone
- `remove_zone_backend()` removes a DNS zone

See also: [Creating a provider](https://hq.apnscp.com/apnscp-pre-alpha-technical-release/#creatingaprovider) (hq.apnscp.com)

## Contributing

Submit a PR and have fun!
