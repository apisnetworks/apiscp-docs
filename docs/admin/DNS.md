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
Any configuration set in this manner may be viewed by the Site Administrator. Always set the the provider key as a vaulted value, discussed below.
:::

```bash
EditDomain -c dns,provider=null -D somesite.com
```

Providers may also be configured within Nexus for the domain.

## Keyring usage

**New in 3.2.42**

Users can read account metadata, which makes storing secret keys in dns,key impossible. [Keyring](../Authentication.md#Keyring) stores codes in `config/auth.yaml` as a reversible encryption. These codes, referenced by index, can be safely stored in account metadata as the reference and not encrypted value is referenced.

```bash
cpcmd keyring:set dns.hetzner 'mysecretkey123'
EditDomain -c dns,provider=hetzner -c dns,key="keyring:dns.hetzner" mydomain.com
```


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

## Bulk record management

`Opcenter\Dns\Bulk` is a collection of tools to manage adding and removing records against all domains on a server. A helper script can be quickly setup in a couple lines of code by creating a file called `fill.php` in `/usr/local/apnscp`:

```php
<?php
	include __DIR__ . '/lib/CLI/cmd.php';

	(new \Opcenter\Dns\Bulk)->remove(new \Opcenter\Dns\Record('_dummy_zone.com', [
		'name' => 'dkim._domainkey', 
		'rr' => 'TXT', 
		'parameter' => ''
	]));
```

Then run `env DEBUG=1 apnscp_php fill.php` to remove records in bulk.

```bash
env DEBUG=1 apnscp_php fill.php
DEBUG   : 1/274 addition - 8 domains in batch
DEBUG   : 2/274 addition - 5 domains in batch
DEBUG   : 3/274 addition - 5 domains in batch
DEBUG   : 4/274 addition - 4 domains in batch
DEBUG   : 5/274 addition - 5 domains in batch
# and so on...
```

Likewise to add a new TXT record called "\_dmarc" use `add()`:

```php
<?php
	include __DIR__ . '/lib/CLI/cmd.php';

	(new \Opcenter\Dns\Bulk)->add(new \Opcenter\Dns\Record('_dummy_zone.com', [
		'name' => '_dmarc', 
		'rr' => 'TXT', 
		'parameter' => 'v=DMARC1; p=reject; rua=mailto:postmaster@apiscp.com, mailto:dmarc@apiscp.com; pct=100; adkim=s; aspf=s'
	]));
```

Or more succinctly to reapply the DMARC record across all domains after updating *[mail]* => *default_dmarc* in [config.ini](Tuneables.md):

```php
<?php
	include __DIR__ . '/lib/CLI/cmd.php';

	(new \Opcenter\Dns\Bulk)->remove(new \Opcenter\Dns\Record('_dummy_zone.com', [
		'name' => '_dmarc', 
		'rr' => 'TXT', 
		'parameter' => ''
	]));

	(new \Opcenter\Dns\Bulk)->add(new \Opcenter\Dns\Record('_dummy_zone.com', [
		'name' => '_dmarc', 
		'rr' => 'TXT', 
		'parameter' => MAIL_DEFAULT_DMARC
	]));
```

### Bulk filtering

A second parameter, `$where`, is a closure to test whether to apply the record for the given domain. `$where` receives two parameters, `apnscpFunctionInterceptor` handler and a `Record` object, which is the proposed record to add or remove.

```php
<?php
	include __DIR__ . '/lib/CLI/cmd.php';

	(new \Opcenter\Dns\Bulk)->remove(new \Opcenter\Dns\Record('_dummy_zone.com', [
		'name' => '_dmarc',
		'rr' => 'TXT',
		'parameter' => ''
	]), function (\apnscpFunctionInterceptor $afi, \Opcenter\Dns\Record $r) {
        // only remove the record if server authorized to handle mail
        return $afi->email_transport_exists($r['zone']);
    });
```

### Replacements

**New in 3.2.26**

Previously record modifications were done using two separate tasks. This can create problems if a record isn't removed or if it doesn't exist in the first place. A third operation, `replace()` calls `dns:modify-record()` to make the operation atomic.

```php
<?php
	include __DIR__ . '/lib/CLI/cmd.php';

	(new \Opcenter\Dns\Bulk)->replace(
		// replace A records named "test"
		new \Opcenter\Dns\Record('_dummy_zone.com', [
			'name' => 'test',
			'rr'   => 'A'
		]),
		// with the IP address 1.2.3.4
		new \Opcenter\Dns\Record(
			'_dummy_zone.com', [
				'parameter' => '1.2.3.4',
				'rr'        => 'A'
		])
	);
```

::: tip Always specify rr
During record canonicalization, the `rr` attribute must be present. This helps ApisCP determine what type of record it is and what treatment *if any* is necessary to standardize it.
:::

#### Replacing metadata

Many records contain more than just a single parameter. For example, an `MX` record is comprised of a numeric **priority** and target **hostname**. `Record` objects can be altered by specifying their parsed attributes rather than relying on less clear space-delimited placement.

The following example updates both the `rname` and `ttl` [fields](https://en.wikipedia.org/wiki/SOA_record) for all domains that utilize the "[powerdns](dns/PowerDNS.md)" DNS driver. An explicit `false` return in the closure skips modifying any record matched from the first parameter.

```php
<?php
	include __DIR__ . '/lib/CLI/cmd.php';

	// empty all NS records on the apex
	// "_dummy_zone.com" has no effect, but used for completeness with the API
	(new \Opcenter\Dns\Bulk)->replace(new \Opcenter\Dns\Record('_dummy_zone.com', [
		'name'      => '',
		'rr'        => 'SOA'
	]), function (\apnscpFunctionInterceptor $afi, \Opcenter\Dns\Record $r) {
		// update "rname" parameter
		$r->setMeta('rname', 'ns1.mydomain.com');
		// update negative cache TTL
		$r->setMeta('ttl', 300);

        // likewise we can statically set the parameter as such
        // $r['parameter'] = 'ns1.mydomain.com. noc.mydomain.com. 2021090229 3600 1800 604800 300';

		// return false to skip processing the record`
		return $afi->dns_get_provider() === 'powerdns';
	});
```

#### Record metadata

| Resource record | Metadata       | Example                                                      |
| --------------- | -------------- | ------------------------------------------------------------ |
| **CAA**         |                | 128 issue "letsencrypt.org"                                  |
|                 | flags          | 128                                                          |
|                 | tag            | issue                                                        |
|                 | data           | letsencrypt.org                                              |
| **CERT**        |                | IPGP 0 0 1457446EFDE098E5C934B69C7DC208ADDE26C2B797          |
|                 | type           | IPGP                                                         |
|                 | key_tag        | 0                                                            |
|                 | algorithm      | 0                                                            |
|                 | data           | 1457446EFDE098E5C934B69C7DC208ADDE26C2B797                   |
| **DNSKEY**      |                | 257 3 5 2018hiZsq1jkCS3osdcAksvcd3oSC0f43OI=                 |
|                 | flags          | 257                                                          |
|                 | protocol       | 3                                                            |
|                 | algorithm      | 5                                                            |
|                 | data           | 2018hiZsq1jkCS3osdcAksvcd3oSC0f43OI=                         |
| **DS**          |                | 25924 5 1 0AC4F2E44C582AE809208098F7BE2C44AB947DCC           |
|                 | key_tag        | 25924                                                        |
|                 | algorithm      | 5                                                            |
|                 | digest_type    | 1                                                            |
|                 | data           | 0AC4F2E44C582AE809208098F7BE2C44AB947DCC                     |
| **LOC**         |                | 33 46 23.6424 N 84 23 42.59 W 293m 0.00m 10000m 10m          |
|                 | lat_degrees    | 33                                                           |
|                 | lat_minutes    | 46                                                           |
|                 | lat_seconds    | 23.6524                                                      |
|                 | lat_direction  | N                                                            |
|                 | long_degrees   | 84                                                           |
|                 | long_minutes   | 23                                                           |
|                 | long_seconds   | 42.59                                                        |
|                 | long_direction | W                                                            |
|                 | altitude       | 293m                                                         |
|                 | size           | 0.00m                                                        |
|                 | precision_horz | 10000m                                                       |
|                 | precision_vert | 10m                                                          |
| **MX**          |                | 10 mail.example.com                                          |
|                 | priority       | 10                                                           |
|                 | data           | mail.example.com                                             |
| **NAPTR**       |                | 100 10 "U" "E2U+sip" "!^.\*$!sip:customer-service@example.com!" . |
|                 | order          | 100                                                          |
|                 | preference     | 10                                                           |
|                 | flags          | U                                                            |
|                 | service        | E2U+sip                                                      |
|                 | regex          | !^.\*$!sip:customer-service@example.com!                     |
|                 | data           | .                                                            |
| **SMIMEA**      |                | 3 0 0 3082036E30820...BE14DA                                 |
|                 | usage          | 3                                                            |
|                 | selector       | 0                                                            |
|                 | matching_type  | 0                                                            |
|                 | data           | 3082036E30820...BE14DA                                       |
| **SOA**         |                | master.example.com. hostmater.example.com. 1 3600 1800 86400 600 |
|                 | mname          | master.example.com                                           |
|                 | rname          | hostmaster.example.com                                       |
|                 | serial         | 1                                                            |
|                 | refresh        | 3600                                                         |
|                 | retry          | 1800                                                         |
|                 | expire         | 86400                                                        |
|                 | ttl            | 600                                                          |
| **SRV**         |                | 10 50 5611 my.jabberserver.com                               |
|                 | service        | *embedded in hostname*                                       |
|                 | protocol       | *embedded in hostname*                                       |
|                 | name           | *embedded in hostname*                                       |
|                 | priority       | 10                                                           |
|                 | weight         | 50                                                           |
|                 | port           | 5611                                                         |
|                 | data           | my.jabberserver.com                                          |
| **SSHFP**       |                | 1 1 0ac4f2e44c582ae809208098f7be2c44ab947dcc                 |
|                 | algorithm      | 1                                                            |
|                 | type           | 1                                                            |
|                 | data           | 0ac4f2e44c582ae809208098f7be2c44ab947dcc                     |
| **TLSA**        |                | 3 1 1 6343fbfe4ab1...dd14467ee0a7ab70d                       |
|                 | usage          | 3                                                            |
|                 | selector       | 1                                                            |
|                 | matching_type  | 1                                                            |
|                 | data           | 6343fbfe4ab1...dd14467ee0a7ab70d                             |
| **URI**         |                | 10 1 "ftp://ftp1.example.com/public"                         |
|                 | priority       | 10                                                           |
|                 | weight         | 1                                                            |
|                 | data           | ftp://ftp1.example.com/public                                |


## Development

### Custom modules

A variety of [modules exist](https://github.com/search?q=topic%3Adns+org%3Aapisnetworks&type=Repositories) on GitHub as boilerplate code. 

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
