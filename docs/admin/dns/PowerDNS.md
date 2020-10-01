# PowerDNS DNS Provider

This is a drop-in provider for [ApisCP](https://apiscp.com) to enable DNS support using PowerDNS. This module may use PostgreSQL or MySQL as a backend driver.

::: warning
CentOS 8 is restricted to PowerDNS 4.3 from EPEL due to library dependencies when MySQL is used as a backend. Use PostgreSQL to avoid this restriction.

```
cpcmd scope:set cp.bootstrapper powerdns_driver pgsql
upcp -sb software/powerdns
```

or at install time, `-s dns_default_provider='powerdns' -s powerdns_driver='pgsql'`
:::

## Nameserver installation

Installation can be chosen at install time or after setup. Installation is only necessary if you intend on running a PowerDNS instance on the server. This section covers *installation*; skip down to **ApisCP DNS provider setup** for information on configuring a server to use PowerDNS as a DNS provider.

```bash
cpcmd scope:set cp.bootstrapper powerdns_enabled true
cpcmd scope:set cp.bootstrapper powerdns_driver mysql
# Or specify "pgsql" to use PostgreSQL
upcp -sb software/powerdns
# Optionally set all accounts to use PowerDNS
cpcmd scope:set dns.default-provider powerdns
```

::: tip DNS-only licenses
ApisCP provides a DNS-only license class that allows ApisCP to run on a server without the capability to host sites. These licenses are free and may be requested via [my.apiscp.com](https://my.apiscp.com).
:::

### Listening for requests

Firewall access is automatically opened inbound for 53/TCP and 53/UDP when PowerDNS is enabled. On CentOS 8+ machines, to avoid a potential service conflict with systemd-resolved, PowerDNS will bind only to the primary IP address. This can be changed by setting `powerdns_dns_bind_address` to a comma-separated string of IPv4 and IPv6 addresses. Prior to PowerDNS 4.3, this value may only accept a list of IPv4 addresses.

```bash
# Listen on 192.168.0.1 and all IPv6 interfaces on pdns v4.3
cpcmd scope:set cp.bootstrapper powerdns_dns_bind_address '192.168.0.1, ::'
upcp -sb software/powerdns
```

### Local PowerDNS

In Local mode, PowerDNS only accepts API calls that originate locally from the server. This allows you to place PowerDNS' API behind a reverse proxy, such as Apache. Local-only is enabled by default.

PowerDNS is setup to accept requests on port 8081 (`powerdns_api_port` setting). Requests require an authorization key that can be found in `/etc/pdns/pdns.conf`

```
# Install jq if not already installed
yum install -y jq
# This is your API key
grep '^api-key=' /etc/pdns/pdns.conf | cut -d= -f2
curl -v -H 'X-API-Key: APIKEYABOVE' http://127.0.0.1:8081/api/v1/servers/localhost | jq .
```

### Idempotently changing configuration

PowerDNS may be configured via files in `/etc/pdns/local.d`. In addition to this location, Bootstrapper supports injecting settings via `powerdns_custom_config`. For example,

```bash
cpcmd scope:set cp.bootstrapper 'powerdns_custom_config' '["allow-axfr-ips":1.2.3.4,"also-notify":1.2.3.4]'
# Then re-run Bootstrapper
upcp -sb software/powerdns
```

`allow-axfr-ips` and `also-notify` directives will be set whenever the role is run.

### Enabling ALIAS support
ALIAS is a synthetic record that allows CNAME records to be set on the zone apex. ALIAS records require `powerdns_enable_recursion` to be enabled as well as an optional `powerdns_recursive_ns` to be set otherwise it will default to the system in `/etc/resolv.conf`.

```bash
cpcmd scope:set cp.bootstrapper powerdns_enable_recursion true
cpcmd scope:set cp.bootstrapper powerdns_recursive_ns '[1.1.1.1,1.0.0.1]'
# Then re-run Bootstrapper
upcp -sb software/powerdns
```

### AXFR-based clustering

PowerDNS expects a custom database cluster by default ([zone kind](https://doc.powerdns.com/authoritative/modes-of-operation.html): NATIVE). Using AXFR-based replication will allow provisioning of zones to slaves by supermaster, but AXFR/NOTIFY lacks support for automated zone removal. PowerDNS must be installed first and a suitable backend selected in as under "[Nameserver installation](#nameserver-installation)". In the following example, master is an unpublished nameserver.

On the master, *assuming 1.2.3.4 and 1.2.3.5 are slave nameservers with the hostnames ns1.domain.com and ns2.domain.com respectively*, add the following configuration:

```bash
cpcmd scope:set cp.bootstrapper powerdns_zone_type master
cpcmd scope:set cp.bootstrapper powerdns_custom_config '["allow-axfr-ips":"1.2.3.4,1.2.3.5","also-notify":"1.2.3.4,1.2.3.5","master":"yes"]'
cpcmd scope:set cp.bootstrapper powerdns_nameservers '[ns1.domain.com,ns2.domain.com]'
env BSARGS="--extra-vars=force=yes" upcp -sb software/powerdns
```

On the slave, *assuming the master is 1.2.3.3 with the hostname master.domain.com*, add the following configuration:

```bash
cpcmd scope:set cp.bootstrapper powerdns_zone_type slave
cpcmd scope:set cp.bootstrapper powerdns_custom_config '["allow-notify-from":"1.2.3.3","slave":"yes"]'
cpcmd scope:set cp.bootstrapper powerdns_nameservers '[ns1.domain.com,ns2.domain.com]'
cpcmd scope:set cp.bootstrapper powerdns_supermaster '[ip:1.2.3.4,nameserver:master.domain.com,account:master]'
env BSARGS="--extra-vars=force=yes" upcp -sb software/powerdns
```

Lastly, on the hosting nodes, *assuming all DNS zone traffic is sent to the unpublished master master.domain.com (IP address 1.2.3.3) with the API key from `/etc/pdns/pdns.conf` of `abc1234`*, configure each to use the same API key and endpoint discussed below.

```bash
cpcmd scope:set cp.bootstrapper powerdns_api_uri 'https://master.mydomain.com/dns'
cpcmd scope:set cp.bootstrapper powerdns_nameservers '[ns1.domain.com,ns2.domain.com]'
cpcmd scope:set cp.bootstrapper powerdns_api_key 'abc1234'
cpcmd scope:set cp.bootstrapper powerdns_zone_type 'master'
env BSARGS="--extra-vars=force=yes" upcp -sb software/powerdns
```

::: tip force=yes
Bootstrapper will avoid overwriting certain configurations unless explicitly asked. `force=yes` is a global variable that forces an overwrite on files.
:::


## Remote API access

In the above example, only local requests may submit DNS modifications to the server. None of the below examples affect querying; DNS queries occur over 53/UDP typically (or 53/TCP if packet size exceeds UDP limits). Depending upon infrastructure, there are a few options to securely accept record submission, *all of which require an API key for submission*.

### SSL + Apache
Apache's `ProxyPass` directive send requests to the backend. Brute-force attempts are protected by [mod_evasive](https://github.com/apisnetworks/mod_evasive ) bundled with ApisCP. Requests over this medium are protected by SSL, without HTTP/2 to ameliorate handshake overhead. In all but the very high volume API request environments, this will be acceptable.

In this situation, the endpoint is https://myserver.apiscp.com/dns. Changes are made to `/etc/httpd/conf/httpd-custom.conf` within the `<VirtualHost ... :443>` bracket (with `SSLEngine On`!). After adding the below changes, `systemctl restart httpd`.

```
<Location /dns>
	ProxyPass http://127.0.0.1:8081
	ProxyPassReverse http://127.0.0.1:8081
</Location>
```

**Downsides**: minor SSL overhead. Dependent upon Apache.
**Upsides**: easy to setup. Protected by threat deterrence. PowerDNS accessible remotely via an easily controlled URI.

In the above example, API requests can be made via https://myserver.apiscp.com/dns, e.g.

```bash
curl -q -H 'X-API-Key: SOMEKEY' https://myserver.apiscp.com/dns/api/v1/servers/localhost
```

#### Disabling brute-force throttling

As hinted above, placing PowerDNS behind Apache confers brute-force protection by mod_evasive. By default, 10 of the same requests in 2 seconds can trigger a brute-force block. Two solutions exist, either  raise the same-page request threshold or disable mod_evasive.

Working off the example above *<Location /dns> ... </Location>*
```
<Location /dns>
	# Raise threshold to 30 same-page requests in 2 seconds
	DOSPageCount 30
	DOSPageInterval 2

	# Or disable entirely
	DOSEnabled off
</Location>
```

### Standalone server

PowerDNS can also run by itself on a different port. In this situation, the network is configured to block all external requests to port 8081 except those whitelisted. For example, if the entire 32.12.1.1-32.12.1.255 network can be trusted and under your control, then whitelist the IP range:

```bash
cpcmd rampart:whitelist 32.12.1.1/24
```

Additionally, PowerDNS' whitelist must be updated as well. This can be quickly accomplished using the *cp.bootstrapper* Scope:

```
cpcmd scope:set cp.bootstrapper powerdns_localonly false
# Then re-run Bootstrapper
upcp -sb software/powerdns
```

**Downsides**: requires whitelisting IP addresses for access to API server. Must run on port different than Apache.
**Upsides**: operates independently from Apache.

The server may be accessed once the source IP has been whitelisted,

```bash
curl -q -H 'X-API-Key: SOMEKEY' http://myserver.apiscp.com/api/v1/servers/localhost
```

## DNS provider

Every server that runs ApisCP may delegate DNS authority to PowerDNS. This is ideal in distributed infrastructures in which coordination allows for seamless [server-to-server migrations](https://docs.apiscp.com/admin/Migrations%20-%20server).

Taking the **API key** from above and using the **SSL + Apache** approach above, let's configure `/usr/local/apnscp/config/auth.yaml`. Configuration within this file is secret and is not exposed via ApisCP's API. Once set restart ApisCP to compile configuration, `systemctl restart apiscp`.

```yaml
pdns:
  # This url may be different if using running PowerDNS in standalone
  uri: https://myserver.apiscp.com/dns/api/v1
  key: your_api_key_here
  type: native
  # Optional SOA formatting, accepts "domain" format argument for current domain
  soa: "hostmaster@%(domain)s"
  ns:
    - ns1.yourdomain.com
    - ns2.yourdomain.com
  recursion: false
    ## Optional additional nameservers
```
* `uri` value is the hostname of your master PowerDNS server running the HTTP API webserver (without a trailing slash)
* `key` value is the **API Key** in `pdns.conf` on the master nameserver.
* `type` value defines **domain type** for replication. It's usually set to `native` when using DB replication, and to `master` when using master-slave pdns replication (in such cluster the [slaves](https://doc.powerdns.com/authoritative/modes-of-operation.html#master-slave-setup-requirements) should set this value to `slave`, while [superslaves](https://doc.powerdns.com/authoritative/modes-of-operation.html#supermaster-automatic-provisioning-of-slaves) will do it automatically when creating ingested zones).
* `soa` value overrides default SOA contact format (*hostmaster@DOMAIN*). An optional format specifier `domain` replaces the format string with the current domain.
* `ns` value is a list of nameservers as in the example above.  Put nameservers on their own lines prefixed with a hyphen and indented accordingly.  There is not currently a limit for the number of nameservers you may use, 2-5 is typical and should be geographically distributed per RFC 2182.
* `recursion` controls ALIAS records, which are CNAMEs on apex (RFC 1034). Enabling requires configuration of `resolver` and `expand-alias` in pdns.conf.

### Setting as default

PowerDNS may be configured as the default provider for all sites using the `dns.default-provider` [Scope](https://docs.apiscp.com/admin/Scopes/). When adding a site in Nexus or [AddDomain](https://docs.apiscp.com/admin/Plans/#adddomain) the key will be replaced with "DEFAULT". This is substituted automatically on account creation.

```bash
cpcmd scope:set dns.default-provider powerdns
```

> Do not set dns.default-provider-key. API key is configured via `config/auth.yaml`.

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

See also: [Creating a provider](https://hq.apiscp.com/apnscp-pre-alpha-technical-release/#creatingaprovider) (hq.apiscp.com)

## Contributing

Submit a PR and have fun!
