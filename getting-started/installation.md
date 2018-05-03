---
layout: docs
title: Installation
group: getting-started
---
* ToC
{:toc} 

# Features

apnscp works best with at least 2 GB for services + caching. Additional features may be installed:

{: .table .table-striped}
| Service  | ?           | Bottleneck  | Description                              |
| -------- | ----------- | ----------- | ---------------------------------------- |
| apnscp   | Required    | -           | Control panel frontend/backend           |
| mcache   | Recommended | Memory      | PHP opcode + session in-memory           |
| vscanner | Optional    | CPU         | Real-time upload filtering, well-known URI lockdown |
| mscanner | Optional    | Memory, CPU | Mail scanning, aggregate Bayesian DB     |
| rampart  | Recommended | CPU         | Real-time brute-force deterrent, DoS filtering |
| argos    | Recommended | CPU         | Monit monitoring profiles + push notification |


## Proactive and reactive monitoring

Argos is a configured Monit instance designed to afford both proactive and reactive monitoring. Rampart provides a denial-of-service sieve for reducing resource swells from misbehaving bots. apnscp includes disallowance of HTTP/1.0 protocol, by default, to reduce malware. All components work to keep your sites more secure by filtering out garbage. [tuned](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/6/html/Power_Management_Guide/Tuned.html) works proactively by retuning system variables as necessary. apnscp ships with the `virtual-guest` profile active.

# Installation

apnscp may be installed from the bootstrap utility. Once installed a 15-day trial begins. A license key may be purchased through [apnscp.com](https://apnscp.com). 

Before installing, ensure the following conditions are met:

- 2 GB RAM (4 GB recommended)
- [][Forward-confirmed reverse DNS](https://en.wikipedia.org/wiki/Forward-confirmed_reverse_DNS), i.e. 64.22.68.1 <-> apnscp.com
- CentOS 7.x or RedHat 7.x
- XFS or ext4* root filesystem

>  \* RedHat officially supports XFS with OverlayFS, which is used to synthesize filesystem layers. ext4 may be used with 3.10.x kernels shipped with RedhHat/CentOS. Officially only  [XFS](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/7.4_release_notes/technology_previews_file_systems#BZ1206277) is supported, but no problems were noted during cursory testing with ext4.
>
> CentOS provides detailed [instructions](https://wiki.centos.org/HowTos/Custom_Kernel) for building a custom 4.x kernel that provides improved OverlayFS support + performance. It is not officially supported by apnscp and thus at one's own risk.

## Bootstrapping apnscp

Run the command from terminal

```shell
wget -O - {{ site.bootstrap_url }} | bash <key id>
```

Where *<key id>* is an activation key generated from [my.apnscp.com](https://my.apnscp.com).

The bootstrapper will install itself, as well as request a SSL certificate from Let's Encrypt's staging environment if possible. Once setup, a password will be generated. Your admin username is "admin" and password listed at the end.

**To change the admin username**, issue `sudo /usr/local/apnscp/bin/cmd auth_change_username <newuser>` after apnscp is installed.

**To change the admin password**, issue `sudo /usr/local/apnscp/bin/cmd auth_change_password <newpassword>` after apnscp is installed.

{% callout info %}
apnscp will initially request a certificate from Let's Encrypt [staging environment](https://letsencrypt.org/docs/staging-environment/). If your forward-confirmed reverse DNS is correct, copy `config/config.ini` to `config/custom/` and change **[letsencrypt]** => **debug** to false, then restart apnscpd, `systemctl restart apnscpd `. apnscp will request a new certificate from Let's Encrypt's production server. Remember that Let's Encrypt limits requests to [20 requests/week](https://letsencrypt.org/docs/rate-limits/), so make sure your DNS is properly setup before disabling debug mode.
{% endcallout %}

{% callout warning %}
Bootstrapping Let's Encrypt will fail if DNS is not setup properly. Check out the [DNS in a Nutshell]({% link admin/dns-in-a-nutshell.md %}) section if you need a primer on how DNS works.
{% endcallout %}

## Changing SQL distributions

apnscp will use the recommended versions of MySQL and PostgreSQL. If you would like to change these defaults create a Yaml formatted file named `/root/apnscp-ansible-defaults.yml ` before running the bootstrapper with the chosen major.minor (or major in the case of "10" for PostgreSQL).

```yaml
---
mariadb:
  version: 10.3
pgsql:
  version: 10
```

## Finishing installation

A reboot is necessary if xfs filesystem is used on /.

```bash
grep '/ xfs' /proc/mounts
```

If grep yields a result and that result shows "noquota", issue a reboot.

```bash
shutdown -r now
```

If grep yields no result, it uses ext4 and quotas have been enabled.

## First login

Visit https://\<domain\>:2083 to login to the panel as "admin". Accept the untrusted certificate if a Let's Encrypt production certificate has not been generated yet. You can fix this later as noted in [Bootstrapping apnscp](#bootstrapping-apnscp).

This is the **Administrator** account that can add, delete, and suspend accounts. **Site Administrators** are administrators of accounts created by an Administrator and are conferred all the rights of a **Secondary User**, with the added benefit of adding on domain, creating databases, and limited sudo. Further service configuration profiles may be setup in the following sections.