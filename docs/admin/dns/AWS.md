# AWS Route 53 DNS Provider

This is a drop-in provider for [apnscp](https://apnscp.com) to enable DNS support for accounts that use AWS. This provider is built into apnscp.

## Configuring

```bash
EditDomain -c dns,provider=aws -c dns,key='[key:ABCDEF123,secret:AbCdEf12345]' domain.com
```

Where the key is created within AWS. Your API key is available within your [AWS IAM Console](https://console.aws.amazon.com/iam/home?#/home). See also [Managing Access Keys for Your AWS Account Root User](https://docs.aws.amazon.com/general/latest/gr/managing-aws-access-keys.html).

### Configurables
* key: IAM key
* secret: IAM secret
* region: AWS region. Refer to [Regions and Availability Zones](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html)

### Setting as default

AWS may be configured as the default provider for all sites using the `dns.default-provider` [Scope](https://gitlab.com/apisnetworks/apnscp/blob/master/docs/admin/Scopes.md). When adding a site in Nexus or [AddDomain](https://hq.apnscp.com/working-with-cli-helpers/#adddomain) the key will be replaced with "DEFAULT". This is substituted automatically on account creation.

```bash
cpcmd config_set dns.default-provider aws
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
