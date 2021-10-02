## NAT/Private networks

ApisCP will attempt to auto-detect your public IP address during installation. This process may fall short if the server is behind a firewall or on a private network.

---

When assigning IPs on a private network always use the internal IP address in the pool and external (public IP address) as the DNS proxy address.

---

### Reference tables

| Pre-install tunables | /root/apnscp-vars.yml            |
| -------------------- | -------------------------------- |
| apnscp_ip4_address   | Set namebased IPv4 address pool. |
| apnscp_ip6_address   | Set namebased IPv6 address pool. |

| Post-install files                   | /usr/local/apnscp                                |
| ------------------------------------ | ------------------------------------------------ |
| storage/opcenter/namebased_ip_addrs  | Set namebased IPv4 address pool. "\n" delimited. |
| storage/opcenter/namebased_ip6_addrs | Set namebased IPv6 address pool."\n" delimited.  |

| [dns] config.ini tunables | cpcmd scope:set cp.config dns x y                    |
| ------------------------- | ---------------------------------------------------- |
| my_ip4                    | IPv4 address ApisCP will report for remote access.   |
| my_ip6                    | IPv6 address ApisCP will report for remote access.   |
| proxy_ip4                 | Override address used to provision A DNS records.    |
| proxy_ip6                 | Override address used to provision AAAA DNS records. |

| [Scopes](Scopes.md) | cpcmd scope:set dns.x y                          |
| ------------------- | ------------------------------------------------- |
| ip4-pool            | Array of IPv4 addresses to serve web sites.       |
| ip6-pool            | Array of IPv6 addresses to serve web sites.       |
| ip4-proxy           | Public IPv4 address. Overridden by dns,proxyaddr  |
| ip6-proxy           | Public IPv6 address. Overridden by dns,proxy6addr |

### Assignment process

Bootstrapper uses `apnscp_ip4_address` and `apnscp_ip6_address` in [apnscp-vars.yml]() to assign default IP addresses. If these values are unset, then `ansible_default_ipv4.address` and `ansible_default_ipv6.address` are used respectively. These values can be examined using Ansible:

```bash
ansible localhost -m setup | grep -B10 -A10 'ipv[46]'
```

These IP addresses are stored in `namebased_ip_addrs` and `namebased_ip6_addrs` within `/usr/local/apnscp/storage/opcenter`, each entry delimited by a newline ("\n"). All domains created within apnscp are assigned IP addresses from this list.

* [`apnscp/bootstrap`](https://github.com/apisnetworks/apnscp-playbooks/tree/master/roles/apnscp/bootstrap) role is the task responsible for this process.

* **Theses files are neither recreated nor modified unless removed from server or altered directly.**

#### Apache

The IP addresses stored in `namebased_XX_addrs` are used to populate the addresses Apache will listen on. Adjustments are made in `/etc/httpd/conf/httpd-custom.conf` based upon addresses listed within the pools.

* [`apache/configuration`](https://github.com/apisnetworks/apnscp-playbooks/tree/master/roles/apnscp/bootstrap) role will modify`httpd-custom.conf` if the addresses change.
* Changing pool addresses will not reassign addresses already assigned to sites. This must be done manually. `EditDomain -c ipinfo,nbaddrs=['new.ip.add.ress'] domain` is the easiest means to accomplish this.

#### DNS

The IP address stipulated in `ipinfo`,`nbaddrs` or `ipinfo`,`ipaddrs` (or `ipinfo6`) will be used unless `dns`,`proxy_ip4` (or `proxy_ip6`) is specified or `dns`,`proxy_ip4` has the special value "DEFAULT". If the special value "DEFAULT" is used, then the config.ini setting [dns] => `proxy_ip4` (or `proxy_ip6`) will be used respectively for public DNS.

* The proxied DNS value (`proxy_ipN`) takes precedence for public DNS even if the site is IP based.
* Specify `dns`,`proxy_ipN` as empty ("") or null to unset public DNS for a site. If this value is removed, then the value from `ipinfoN`,`nbaddrs` or `ipinfoN`,`ipaddrs` (depending upon setup) will be used for DNS.
* Specifying DEFAULT for the value will use [dns] => `proxy_ipN`

### IP-based hosting

When `ipinfo`,`namebased` is `0` (false), a unique IP address is assigned for each account. This assignment pool is pulled from [dns] => `allocation_cidr` in config.ini based upon PTR presence. This IP address must be reachable internally; therefore, the value for ipaddrs will always reference the private/NAT network. PTRs, if supported by the DNS module, are created for both the internal network and public IP.

## AWS sample configuration with Route53

* **Instance type**: t2.small
* **IPv4 Public IP**: 18.217.104.240
* **IPv4 Internal IP** (via `ip addr list`): 172.31.32.146
* **apnscp_system_hostname** (via /root/apnscp-vars.yml): aws.apiscp.com
* **Test site**: aws-test.apiscp.com (18.217.104.240)
* DNS handled by **AWS Route53**

Set `dns.ip4-proxy` configuration [scope](Scopes.md) to report 18.217.104.240 as the public IP. All sites created will prefer this remote IP with DNS provisioning and internal checks.

```bash
cpcmd config:set dns.ip4-proxy 18.217.104.240
cpcmd config:set dns.default-provider aws
cpcmd config:set dns.default-provider-key '[key:YOURKEY,secret:YOURSECRET]'
/usr/local/sbin/AddDomain -c siteinfo,domain=aws-test.apiscp.com
cpcmd -d aws-test.apiscp.com letsencrypt:append '[aws-test.apiscp.com]'
```

If changing the remote IP address, as with an AWS Elastic IP for example from 18.217.104.240 to 3.18.1.157. When appending SSL hostnames to the request immediately after changing IPs be sure to disable IP address checks:

```bash
cd /home/virtual
for site in site* ; do
 /usr/local/sbin/EditDomain -c dns,proxyaddr=['3.18.1.157'] "$site"
done
cpcmd -d aws-test.apiscp.com letsencrypt:append '[www.aws-test.apiscp.com]' false
```

ApisCP performs an internal IP check to filter defunct domains from the SSL certificate prior to requesting. Failure to do so may result in hostnames being pruned from renewal.

```bash
cpcmd -d site1 letsencrypt:append '[www.aws-test.apiscp.com]'
WARNING: hostname `aws-test.apiscp.com' IP `18.217.104.240' doesn't match hosting IP `3.18.1.157', skipping request
INFO    : reminder: only 5 certificates may be issued per week
INFO    : reloading web server in 2 minutes, stay tuned!
```

This check may be disabled permanently by setting [letsencrypt] => verify_ip to false in config.ini:

```bash
cpcmd config:set cp.config letsencrypt verify_ip false
```

This may result in domains that have expired to halt automatic SSL renewal.

## Problems

### Changing IPs
A machine may change either from a private to public network or its public IP change during its lifetime. In such situations, it's necessary to update the IP addresses ApisCP listens on and the IP addresses for each site. [Bootstrapper](Bootstrapper.md) can update all internal IP mappings by passing `force=yes`, which has specific meaning for some tasks.

```bash
env BSARGS="--extra-vars=force=yes" upcp -sb
```

It is necessary to update the public IP addresses for each site as well. Namebased IP addresses are assigned round-robin at creation. For example if a server has `1.2.2.2` and `1.4.5.6` then site1 is allocated `1.2.2.2`, site2 `1.4.5.6`, site3 `1.2.2.2`, and so on.

Confirm the IP address bool has been updated in `/etc/virtualhosting/namebased_ip_addrs` and `/etc/virtualhosting/namebased_ip6_addrs`, then clear `ipinfo,nbaddrs` and `ipinfo,nb6addrs` respectively for reassignment. Namebased sites may be selected using a [collection](cpcmd-examples.md#collections).

```bash
cpcmd -o json admin:collect null '[ipinfo.namebased:1]' | jq -r 'keys[]' | while read SITE ; do
	echo "Updating $(get_config $SITE siteinfo domain) - $SITE"
	EditDomain -c ipinfo,nbaddrs=[] -c ipinfo,namebased=1 -c ipinfo6,nbaddrs=[] $SITE
done
```

### Multihomed networks

Consider a situation in which a network has 2 public IPs, **64.22.68.12** and **64.22.68.14**. Outbound Internet traffic goes over **64.22.68.14**. Inbound server traffic for websites goes over **64.22.68.12**. Detection will yield **64.22.68.14** while **64.22.68.12** is intended. It is necessary to edit *[dns],proxyaddr*  and *[dns],proxyaddr6* with the proper IP address after installation.

```bash
cpcmd scope:get cp.config dns proxyaddr
# Reports incorrect value, 64.22.68.14
cpcmd scope:set cp.config dns proxyaddr 64.22.68.12
# DNS will now publish 64.22.68.12 for all domains
```

Likewise conflicts may also affect hairpin checks, which is a best-effort attempt to determine if the public IP forwards HTTP requests. Hairpin checks are essential during [SSL certificate](./SSL.md) prechecks to reduce error counts with Let's Encrypt. 

A hairpin check from server1.mydomain.com with the public IP 64.22.68.12 as reported by DNS would be as follows,

```curl
curl -I --resolve server1.mydomain.com:80:64.22.68.12 http://server1.mydomain.com/monit.html
```

A timeout or non-200 response - assuming `/var/www/html/monit.html` exists on the ApisCP server - would be indicative of a router that does not support hairpinning.

In such situations, set *[dns],hairpin* either 1 (public IP supports hairpinning) or 0 (public IP does not support hairpinning). ApisCP will always perform a best-effort guess if *[dns],proxyaddr* or *[dns],proxyaddr6* is configured; however these guesses may fail when DNS conflicts exist requiring manual override.

