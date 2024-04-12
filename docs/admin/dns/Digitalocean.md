# DigitalOcean DNS Provider

This is a drop-in provider for [apnscp](https://apnscp.com) to enable DNS support for accounts that use DO. This provider is built into apnscp.

## Configuring

```bash
EditDomain -c dns,provider=digitalocean -c dns,key=abcdef1234567890 domain.com
```

Where the key is created within DO. See [How to Create a Personal Access Token](https://www.digitalocean.com/docs/api/create-personal-access-token/).

### Setting as default

DO may be configured as the default provider for all sites using the `dns.default-provider` [Scope](https://gitlab.com/apisnetworks/apnscp/blob/master/docs/admin/Scopes.md). When adding a site in Nexus or [AddDomain](https://hq.apnscp.com/working-with-cli-helpers/#adddomain) the key will be replaced with "DEFAULT". This is substituted automatically on account creation.

In a multi-user environment, [Keyring](../Authentication.md#Keyring) usage is necessary to protect users from accessing the password. When setting this value using the dns.default-provider-key in 3.2.42+, this value is automatically encoded as a Keyring value. Automatic wrapping as a Keyring object may be altered by changing **[auth]** => *keyring_provider_types*.

```bash
cpcmd scope:set dns.default-provider digitalocean
# Note, this method is insecure prior to 3.2.42, see below!
cpcmd scope:set dns.default-provider-key 'abcdef1234567890'
```

::: warning 
Note that it is not safe to set this value directly in config.ini as a server-wide default in untrusted multiuser environments. A user with panel access can retrieve your key `common_get_service_value dns key` or even using Javascript in the panel, `apnscp.cmd('common_get_service_value',['dns','key'], {async: false})`.

Implicit [Keyring](../../Authentication.md#Keyring) encoding masks the actual value using a server secret. 
:::

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