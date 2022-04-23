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

![AXFR cluster layout](./powerdns-axfr-cluster.svg)

On the **master**, *assuming 1.2.3.4 and 1.2.3.5 are slave nameservers with the hostnames ns1.domain.com and ns2.domain.com respectively*, add the following configuration:

```bash
cpcmd scope:set cp.bootstrapper powerdns_enabled true
cpcmd scope:set cp.bootstrapper powerdns_zone_type master
cpcmd scope:set cp.bootstrapper powerdns_custom_config '["allow-axfr-ips":"1.2.3.4,1.2.3.5","also-notify":"1.2.3.4,1.2.3.5","master":"yes"]'
cpcmd scope:set cp.bootstrapper powerdns_nameservers '[ns1.domain.com,ns2.domain.com]'
env BSARGS="--extra-vars=force=yes" upcp -sb software/powerdns
```

On the **slave(s)**, *assuming the master is 1.2.3.3 with the hostname master.domain.com*, add the following configuration:

```bash
cpcmd scope:set cp.bootstrapper powerdns_enabled true
cpcmd scope:set cp.bootstrapper powerdns_zone_type slave
cpcmd scope:set cp.bootstrapper powerdns_custom_config '["allow-notify-from":"1.2.3.3","slave":"yes","superslave":"yes"]'
cpcmd scope:set cp.bootstrapper powerdns_nameservers '[ns1.domain.com,ns2.domain.com]'
cpcmd scope:set cp.bootstrapper powerdns_supermaster '[ip:1.2.3.3,nameserver:ns1.domain.com,account:master]'
cpcmd scope:set cp.bootstrapper powerdns_api_uri 'https://master.domain.com/dns/api/v1'
env BSARGS="--extra-vars=force=yes" upcp -sb software/powerdns
```

Lastly, on the **hosting nodes**, *assuming all DNS zone traffic is sent to the unpublished master master.domain.com (IP address 1.2.3.3) with the API key from `/etc/pdns/pdns.conf` of `abc1234`*, configure each to use the same API key and endpoint discussed below.

```bash
cpcmd scope:set cp.bootstrapper powerdns_api_uri 'https://master.domain.com/dns/api/v1'
cpcmd scope:set cp.bootstrapper powerdns_nameservers '[ns1.domain.com,ns2.domain.com]'
cpcmd scope:set cp.bootstrapper powerdns_api_key 'abc1234'
cpcmd scope:set cp.bootstrapper powerdns_zone_type 'master'
env BSARGS="--extra-vars=force=yes" upcp -sb software/powerdns
```

::: tip force=yes
Bootstrapper will avoid overwriting certain configurations unless explicitly asked. `force=yes` is a global variable that forces an overwrite on files.
:::

Be sure to skip down to the [Remote API access](#remote-api-access) section to configure the hidden master endpoint.

#### Exposed master

In the above, a hidden master is used which obscures the server that handles updates. If we promote **primary nameserver** to master, which removes a hidden master setup, then the diagram changes slightly.

![AXFR cluster layout](./powerdns-axfr-exposed-cluster.svg)

On the **primary nameserver** NS1, *assuming 1.2.3.5 is a slave nameserver with the nameserver names ns1.domain.com and ns2.domain.com respectively*, add the following configuration:

```bash
cpcmd scope:set cp.bootstrapper powerdns_enabled true
cpcmd scope:set cp.bootstrapper powerdns_zone_type master
cpcmd scope:set cp.bootstrapper powerdns_custom_config '["allow-axfr-ips":"1.2.3.5","also-notify":"1.2.3.5","master":"yes"]'
cpcmd scope:set cp.bootstrapper powerdns_webserver_enable true
cpcmd scope:set cp.bootstrapper powerdns_nameservers '[ns1.domain.com,ns2.domain.com]'
env BSARGS="--extra-vars=force=yes" upcp -sb software/powerdns
```

On the **slave(s)**, *assuming the master is 1.2.3.4 with the hostname ns1.domain.com*, add the following configuration:

```bash
cpcmd scope:set cp.bootstrapper powerdns_enabled true
cpcmd scope:set cp.bootstrapper powerdns_zone_type slave
cpcmd scope:set cp.bootstrapper powerdns_custom_config '["allow-notify-from":"1.2.3.4","slave":"yes","superslave":"yes"]'
cpcmd scope:set cp.bootstrapper powerdns_webserver_enable false
cpcmd scope:set cp.bootstrapper powerdns_nameservers '[ns1.domain.com,ns2.domain.com]'
cpcmd scope:set cp.bootstrapper powerdns_supermaster '[ip:1.2.3.4,nameserver:ns1.domain.com,account:master]'
cpcmd scope:set cp.bootstrapper powerdns_api_uri 'https://ns1.domain.com/dns/api/v1'
env BSARGS="--extra-vars=force=yes" upcp -sb software/powerdns
```

Lastly, on the **hosting nodes**, *assuming all DNS zone traffic is sent to primary nameserver at ns1.domain.com (IP address 1.2.3.4) with the API key from `/etc/pdns/pdns.conf` of `abc1234`*, configure each to use the same API key and endpoint discussed below.

```bash
cpcmd scope:set cp.bootstrapper powerdns_api_uri 'https://ns1.domain.com/dns/api/v1'
cpcmd scope:set cp.bootstrapper powerdns_nameservers '[ns1.domain.com,ns2.domain.com]'
cpcmd scope:set cp.bootstrapper powerdns_api_key 'abc1234'
cpcmd scope:set cp.bootstrapper powerdns_zone_type 'master'
env BSARGS="--extra-vars=force=yes" upcp -sb software/powerdns
```

#### Updating NS records

PowerDNS is configured by default to use "127.0.0.1" for its NS records. In a working environment this is never the right option, but helps bridge learning. [Bulk update](../DNS.md#bulk-record-management)  can be used to clear all NS records on the apex, then provision NS records as  set via `powerdns_nameservers`.

Assuming your new DNS records are `ns1.yourserver.com` and `ns2.yourserver.com`, the following suffices:

First, to change the nameservers records used to *provision new domains*, use Bootstrapper.

```bash
cpcmd scope:set cp.bootstrapper powerdns_nameservers '[ns1.yourserver.com,ns2.yourserver.com]'
env BSARGS="--extra-vars=force=yes" upcp -sb software/powerdns
```

Next, to update NS records for existing domains.

```php
include __DIR__ . '/lib/CLI/cmd.php';

$handler = new \Opcenter\Dns\Bulk();

// empty all NS records on the apex
// "_dummy_zone.com" has no effect, but used for completeness with the API
$handler->remove(new \Opcenter\Dns\Record('_dummy_zone.com', [
    'name' => '', 
    'rr' => 'NS', 
    'parameter' => ''
]), function (\apnscpFunctionInterceptor $afi, \Opcenter\Dns\Record $r) {
    return $afi->dns_get_provider() === 'powerdns';
});

$handler->add(new \Opcenter\Dns\Record('_dummy_zone.com', [
    'name' => '', 
    'rr' => 'NS', 
    'parameter' => 'ns1.yourserver.com'
]), function (\apnscpFunctionInterceptor $afi, \Opcenter\Dns\Record $r) {
    return $afi->dns_get_provider() === 'powerdns';
});

$handler->add(new \Opcenter\Dns\Record('_dummy_zone.com', [
    'name' => '', 
    'rr' => 'NS', 
    'parameter' => 'ns2.yourserver.com'
]), function (\apnscpFunctionInterceptor $afi, \Opcenter\Dns\Record $r) {
    return $afi->dns_get_provider() === 'powerdns';
});
```

Save the script in `/usr/local/apnscp/update.php` and run `env DEBUG=1 apnscp_php /usr/local/apnscp/update.php` to replace all NS records for domains that use PowerDNS.

#### Updating SOA records
**New in 3.2.26**

[SOA](https://en.wikipedia.org/wiki/SOA_record) controls several important replication attributes of a DNS zone. Changing primary nameservers or modifying zone defaults would necessitate updating SOA records. This can be done in a similar fashion using `Opcenter\Dns\Bulk`. For convenience `replace()` can accept a `Record` object or closure, which will be called with the matching record. If a closure is used, the closure may return `false` to skip modifying the record otherwise the second parameter, a `Record` object, is used as replacement.

It is the responsibility of the closure to modify the `Record` resource;

```php
include __DIR__ . '/lib/CLI/cmd.php';
$handler = new \Opcenter\Dns\Bulk();

// PowerDNS doesn't let us delete the record; only replace() works
// "_dummy_zone.com" has no effect, but used for completeness with the API
$handler->replace(new \Opcenter\Dns\Record('_dummy_zone.com', [
    'name'      => '',
    'rr'        => 'SOA'
]), function (\apnscpFunctionInterceptor $afi, \Opcenter\Dns\Record $r) {
    // update "rname" parameter
    $r->setMeta('rname', 'ns1.foobar.com');
    // update negative cache TTL
    $r->setMeta('ttl', 300);
    
    // return false to skip processing the record`
    return $afi->dns_get_provider() === 'powerdns';
});
```

More examples are available in [DNS.md](../DNS.md#bulk-record-management).

#### Periodic maintenance

Sometimes you may want to force a zone update - if changing public nameservers - or prune expired domains since AXFR-based clusters do not afford automated zone removals. These snippets come from [hopefully.online](https://hopefully.online/powerdns-master-slave-cluster):

- **all zone renotify**

    ```bash
    pdns_control list-zones --type master | sed '$d' | xargs -L1 pdns_control notify
    ```

- **zone cleanup**

    ```bash
    pdns_control list-zones --type slave | sed '$d' | xargs -I {} sh -c "host -T -t SOA {} master.domain.com | tail -n1 | grep -q 'has no SOA record' | pdnsutil delete-zone {}"
    ```

::: tip TCP mode
DNS uses UDP by default, which is a lossy protocol that does not guarantee
delivery. Enable TCP mode with `-T` to guarantee the transmission was
received by master.domain.com.
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

### Enabling webserver statistics

A separate webserver is available for real-time statistics through a UI. Additional authentication is required with `webserver-password` as PowerDNS cannot see the connecting IP behind a proxy (cf. [powerdns/pdns#10332](https://github.com/PowerDNS/pdns/issues/10332)). 

```bash
cpcmd scope:set cp.bootstrapper powerdns_webserver_enable true
upcp -sb software/powerdns
```

*Note:* statistics may also be retrieved using `pdns_control show "*"`

#### Disabling brute-force throttling

As hinted above, placing PowerDNS behind Apache confers brute-force protection by mod_evasive. By default, 10 of the same requests in 2 seconds can trigger a brute-force block. Two solutions exist, either  raise the same-page request threshold or disable mod_evasive.

Working off the example above *<Location /dns> ... </Location>*
```
<Location /dns>
	# Raise threshold to 30 same-page requests in 2 seconds
	DOSPageCount 60
	DOSPageInterval 2

	# Or disable entirely
	DOSEnabled off
</Location>
```
#### 429 errors
429 Rate limit exceeded occurs whenever the page count exceeds the threshold. Raising `DOSPageCount`/`DOSPageInterval` will raise the threshold to trigger a 429 response. See also [Evasive.md](../Evasive.md).

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
