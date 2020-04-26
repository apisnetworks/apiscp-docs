# Cloudflare DNS Provider

This is a drop-in provider for [apnscp](https://apnscp.com) to enable DNS support for accounts that use Cloudflare. This provider is built into apnscp.

## Configuring

```bash
EditDomain -c dns,provider=cloudflare -c dns,key='[key:abcdef012456789,email:foo@bar.com,proxy:false]' domain.com
```

Where the key is created within Cloudflare. See [Where do I find my Cloudflare API key](https://support.cloudflare.com/hc/en-us/articles/200167836-Where-do-I-find-my-Cloudflare-API-key-). `email` and `key` are mandatory variables. 

* `proxy` (true/false)- optionally set all records created to proxy through CF, i.e. be behind CF's IP address. 
* `jumpstart` (true/false)- imports records based on Cloudflare scan

### Using API tokens
An restrictive API token may be used instead of the API key that grants unrestricted access to one's account. When creating an API token in Cloudflare, ensure that **Zone.Zone** and **Zone.DNS** privileges are enabled with *edit* access.
This token may be specified on a line by itself or mixed with additional options:

```bash
EditDomain -c dns,provider=cloudflare -c dns,key='[key:WgBu1xfXP6wvR-ABcDe_ff,proxy:false]' domain.com
# may also be referenced as...
EditDomain -c dns,provider=cloudflare -c dns,key='WgBu1xfXP6wvR-ABcDe_ff' domain.com
```

### Setting as default

Cloudflare may be configured as the default provider for all sites using the `dns.default-provider` [Scope](https://gitlab.com/apisnetworks/apnscp/blob/master/docs/admin/Scopes.md). When adding a site in Nexus or [AddDomain](https://hq.apnscp.com/working-with-cli-helpers/#adddomain) the key will be replaced with "DEFAULT". This is substituted automatically on account creation.

```bash
cpcmd scope:set dns.default-provider cloudflare
cpcmd scope:set dns.default-provider-key '[key:abcdef0123456789,email:foo@bar.com,proxy:false]'
```
::: danger
Note that it is not safe to set this value as provider default in untrusted multiuser environments. A user with API access can retrieve your key `common_get_service_value dns key` or even using Javascript in the panel, `apnscp.cmd('common_get_service_value',['dns','key'], {async: false})`.
:::

::: tip
This module provides a safe location for a global key setting in `config/auth.yaml`. See the following section for details.
:::

### Safely setting global default
Cloudflare settings may be located in `config/auth.yaml`, which is outside the visibility of site owners. Global settings will be used only if *dns*,*key* is set to null/None. All other values are broken out as separate fields, that is to say key must be scalar and may not be an inline complex type (*[key:val,key2:val2]*).

```yaml
cloudflare:
  key: "xnYaOGNVFc-nx2QsBkak-A_EjmHdVhZceSqLB7ty"
  proxy: true
```
or alternatively,

```yaml
cloudflare:
  key: "abcdef"
  email: 'me@mydomain.com'
  proxy: true
```

After making changes restart ApisCP to recompile configuration, `systemctl restart apiscp`. When adding a site, omit dns,key. If `dns.default-provider-key` **is set**, then this value must be explicitly passed as null (or "None"). If `dns.default-provider-key` **is not** set, then this value may be omitted.

Once set, a site may be added through Nexus or the command-line as follows,

```bash
AddDomain -c siteinfo,domain=sometest.com -c dns,provider=cloudflare -c dns,key=None
```

::: details
"None" and "null" are stored internally as "null" (no value set). "None" isn't a typical value in PHP. It's an artifact that dates back to ApisCP's origins as a frontend to Ensim WEBppliance, which was written in Python. "None" is equivalent to "null" in Python. For some time ApisCP had to accept both values for compatibility!
:::

## Components

- Module- overrides [Dns_Module](https://github.com/apisnetworks/apnscp-modules/blob/master/modules/dns.php) behavior
- Validator- service validator, checks input with AddDomain/EditDomain helpers

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