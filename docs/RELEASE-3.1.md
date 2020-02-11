---
title: 3.1
---

apnscp 3.1 has been released! Codenamed "Business as Usual", 3.1 shifts focus back from widescale adoption to innovation. This release covers several postponed items that were intended in 3.1, but required significant buildup of other areas to satisfactorily implement.

## PHP-FPM

PHP-FPM is implemented as a socket-activated service in systemd. Socket activation only spawns a worker pool on page activity, which mitigates a Thundering herd problem in mass deployments. PHP-FPM has been tested exhaustively on 500+ account platforms with minimal impact of service on startup.

This implementation makes use of systemd's excellent dependency tracking to only start once MySQL and PostgreSQL further enhancing startup abilities of both database servers. Upon activation, PHP-FPM worker is chroot'd to the respective account either as an unprivileged system user or - as a cPanel behavior - the account user; however this practice is highly discouraged. Documentation is covered in [PHP-FPM.md](docs/admin/PHP-FPM.md).

## TimescaleDB

Massive time-series data aggregation poses a significant challenge as platforms accumulate more data with age. Bandwidth data is binned every 3 minutes (controlled via *[bandwidth]* => *resolution* in config.ini). Over the span of 12 months with over 500 sites the number of records balloons to 87.6 million records; a lot to sum when looking at historical records. Worse yet record lookups become expensive with simple algorithms. For example, average case runtime to retrieve a record requires 27 steps (big O log2). We can do better by partitioning data into windows. Knowing that bandwidth cycles every month, data can be separated into smaller **chunks**, 30 day 7.3 million records per segment thus limiting the amount of searches required by 15%. These chunks are unified into a single virtual table called a **hypertable** thus ensuring  transparent storage mechanism for time-series data.

![hypertable and chunks via TimescaleDB](https://assets.iobeam.com/images/docs/illustration-hypertable-chunk.svg)

Improved retrieval performance isn't the best feature, continuous aggregates ("cagg") are! A cagg works in the background, automatically, to summarize data from individual data points.  Going back to the bandwidth example, if we know bandwidth updates every 5 minutes, TimescaleDB recalculates the total, storing in cache, every 5 minutes in revised totals.

Bandwidth lookups fly now! Prior to caggs, the previous bandwidth overage query took over 20 seconds to run; now it completes in 1/100th the time, 200 ms.

As part of 3.1, TimescaleDB will provide real-time reporting on account resource usage via cgroups allowing the panel to quickly revoke access on sites that exceed their 24-hour quotas (or 30-day). WIndows are flexible and extensions simple to use. For example to get the bandwidth used by all domains yesterday, in 5 minute resolutions filling in omissions in data:

```sql
SELECT
 site_id,
 TIME_BUCKET_GAPFILL('5 minutes', ts) AS bucket,
 SUM(in_bytes+out_bytes) AS sum
FROM
 bandwidth_log
WHERE
 ts >= NOW() - INTERVAL '1 day' AND ts < NOW()
GROUP BY site_id, bucket
ORDER BY site_id, bucket;
```

## Bandwidth limits

Following Timescale implementation, bandwidth enforcement is active in 3.1. Thresholds may be configured in config.ini within *[bandwidth]* that control notification and suspension thresholds. Bandwidth may be optionally forgiven using the bandwidth:amnesty API method for appliance admin:

```bash
# Bandwidth is now forgiven for the domain, which ends on the bandwidth cycle day
cpcmd bandwidth:amnesty domain.com
```

## ACME v2

apnscp now supports Let's Encrypt ACME v2 protocol. Upon upgrading to apnscp 3.1, an automated migration will update all v1 certificates, which begins its sunset [November 1](https://community.letsencrypt.org/t/end-of-life-plan-for-acmev1/88430). Wildcard certificates are supported now supported as well. Provided apnscp has control over the DNS for the domain (see DNS.md), this challenge attempt is preferred extending the theoretically maximum number of SSL-protected domains to 50 (wildcard + base domain, 100 hostname limit in SNI). Let's Encrypt issuance is covered in SSL.md.

## cPanel/apnscp imports

Restoring from both cPanel and apnscp backups are now supported in apnscp. cPanel restores cover all aspects except for PostgreSQL backups. apnscp restore support is in preview and will be further developed in 3.1. Backups are always strongly encouraged. A [drop-in solution](https://github.com/apisnetworks/apnscp-bacula ) with Bacula exists as an addin for apnscp. See Migrations.md for additional information.

## Bootstrapper addin facility

Addins are drop-in packages that alter the platform in a meaningful way. As with Bootstrapper, any package that alters system state must do so using Ansible to ensure platform durability. Unleashing a shell script with an assortment of fallible `sed` commands (that can't even be bothered to `set -euo pipefail`!) are so 1996. Running a couple commands that automate changes and only change what needs to be changed, plus give you a digest of these changes, that's now.

A few packages of varying complexity were released during 3.1 development to provide a framework for using the Addin system:

- [PowerDNS](https://github.com/LithiumHosting/apnscp-powerdns) courtesy Lithium Hosting
- [Bacula](https://github.com/apisnetworks/apnscp-bacula)
- [rspamd DQS](https://github.com/apisnetworks/apnscp-rspamd-dqs)

While not strictly enforced yet, we ask that third-party developers who release modules bundle these modules with [plays](https://docs.ansible.com/ansible/latest/user_guide/playbooks_intro.html) so that an administrator may run the plays to heal the platform. If you have any questions with writing plays, stop by our [developer chat](https://discord.gg/wDBTz6V)!

## Delegated whitelisting

Rampart provides generalized protection to all facets of platform: MySQL, IMAP, POP3, SMTP, SSH, panel access, HTTP, and so on. Any service accessible is guarded against brute-force attacks by Rampart, which results in some interesting scenarios with SOHO businesses. Delegated whitelisting allows account administrators to declare up to *n IPv4/IPv6 addresses* immune from brute-force deterrence.

When the address is in a delegated whitelist (Account > Whitelist), an address is immune from brute-force blocks. A user that logs into the panel with the blocked IP address is still presented with a popup explaining the service that triggered a block.

## SSO subordinate domains

Bridging the gap between reseller and typical hosting accounts, apnscp now supports login to child domains by the parent. For the first domain, set the service parameter `billing,invoice=IDENTIFIER`. For each child domain parented to this domain, set `billing,parent_invoice=IDENTIFIER`.  Child domains may not login to the parent unless transitioned into by the parent and only within the session transitioned from which the parent transitioned.

![img](https://hq.apiscp.com/content/images/2019/08/My-First-Document--1-.png)

Domain transitioning is a simple process within the user card dropdown. If no known domains are on the same server as the parent, the domain is presented normally.

![img](https://hq.apiscp.com/content/images/2019/08/EChFArEW4AE_OIo--1-.png)

## IMAP/POP3/SMTP SNI

IMAP, POP3, and SMTP now support SNI via implicit SSL. Any SSL certificate installed on an account is also available for use with email. Note that explicit (opportunistic SSL via "STARTTLS") does not support SNI. IMAPS (993), POP3S (995), and SMTPS (465) now utilize SNI via haproxy as an SSL terminator. Further work will explore using haproxy to terminate HTTPS traffic as well greatly simplifying the HTTP stack, providing a lightweight DoS sink, and providing zero downtime rolling restarts for all SSL certificates changes. haproxy may be enabled (or disabled) using the cp.bootstrapper [Scope](Scopes.md).

```bash
cpcmd scope:set cp.bootstrapper haproxy_enabled true
upcp -sb
```

## IPv6 support

IPv6 support is here! All components are covered (via [PR#1](https://github.com/apisnetworks/apnscp/issues/1)).

## PowerDNS support

As a contribution from [Lithium Hosting](https://lithiumhosting.com), apnscp now includes support for PowerDNS. When migrating from a cPanel server that already uses PowerDNS, apnscp will work in tandem with the DNS cluster to change DNS.

```bash
cpcmd scope:set cp.bootstrapper powerdns_enabled true
upcp -sb software/powerdns
cpcmd scope:set dns.default-provider powerdns
```

Additional configuration will be necessary in auth.yaml if the same server is not hosting the DNS master. [README.md](https://gitlab.com/apisnetworks/apnscp/blob/master/resources/playbooks/roles/software/powerdns-support/README.md) as part of the PowerDNS distribution covers configuration in depth!

## WHMCS compatibility

A few changes were introduced to improve compatibility with account tracking in WHMCS, including the separate [WHMCS module](https://github.com/lithiumhosting/apnscp-whmcs) provided by Lithium Hosting. Disallow username changes via *[auth]* => *allow_username_change*. Users may no longer change their username thus allowing WHMCS to operate correctly.

```bash
cpcmd scope:set cp.config auth allow_username_change false
```

## cpcmd yaml/json output

`cpcmd` now supports a variety of output specifiers including Yaml and JSON:

```bash
cpcmd -o yaml admin:list-plans
cpcmd -o json admin:list-plans
cpcmd -o cli admin:list-plans
cpcmd -o var_dump admin:list-plans
# And for nostalgia...
cpcmd -o print admin:list-plans
```

## IO + resource throttling

To set a 2 MB/s write throttle on all PHP-FPM tasks use `blkio,writebw` or throttle IOPS use the "iops" equivalent, `blkio,writeiops`:

```bash
EditDomain -c cgroup,writebw=2 domain.com
# Apply the min of blkio,writ.ebw/blkio,writeiops
# Both are equivalent assuming 4 KB blocks
EditDomain -c cgroup,writebw=2 -c blkio,writeiops=512 domain.com
```

Memory ceilings likewise may be set via `cgroup,memory`.

```bash
# Set ceiling of 512 MB for all processes
EditDomain -c cgroup,memory=512 domain.com
```

IO and CPU weighting may be set via ioweight and cpuweight respectively. ioweight requires usage of the CFQ/BFQ IO elevators.

```bash
# Default weight is 100
# Halve IO priority, double CPU priority
EditDomain -c cgroup,ioweight=50 -c cgroup,cpuweight=200 domain.com
```

IO throttles also affect tasks spawned from the terminal including Node, Ruby, and Python processes in addition to mail services (last mile delivery via Maildrop + Dovecot IMAP/POP3 access).

## Web App blacklists

Disallow web apps for your site via `*[webapps]* => *blacklist*. For example to disable all web apps but WordPress:

```bash
cpcmd scope:set cp.config webapps blacklist '*,!wordpress'
```

## Security improvements

Following an excellent [Rack911 audit](https://hq.apiscp.com/ap-01-ap-07-security-vulnerability-update/), further adjustments have been introduced in 3.1 to reinforce the principle of least privilege:

- mysql:export-pipe(), pgsql:export-pipe() drop permissions prior to export
- Job runner drops permissions voluntarily unless a job requests to elevate. Certain tasks such as Bootstrapper that require elevation will continue to run without occupying a worker slot.
- Process calls that drop via suid/sgid settings drop UID/GID in all components of the pipeline
- Any process spawned with an effective UID will continue to retain this effective UID for successive spawns. Forked processes can optionally discard the privileged UID (normally "root") by setting the "suid" option prior to execution.
- unshare() syscall is experimental. Spawning a session via SSH, crond, or login will create a new [PID namespace](http://man7.org/linux/man-pages/man7/pid_namespaces.7.html). PID namespacing detaches the system process tree from the active session replacing it with a limited process tree. This deflects chroot breakage via /proc/1/root traversal.

## Feature renames

Scopes are now accessible via the scope module. In 3.0 Scopes resided in a confusing "config" module. apnscp Scope namespace has been shorted to "cp" as well.

```bash
# On 3.0:
cpcmd config:get apnscp.update-policy
# On 3.1:
cpcmd scope:get cp.update-policy
```

## FLARE service

FLARE is a beacon service to allow apnscp to push out multiple, same-day updates in response to zero-day threats. All 3.1 servers participate in FLARE. A FLARE signal forces `upcp`, which respects the update policy of the server
