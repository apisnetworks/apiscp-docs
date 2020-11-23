# Firewall

ApisCP utilizes [firewalld](https://firewalld.org/) for its firewall. Rampart is a module that serves as a wrapper for [fail2ban](https://www.fail2ban.org/wiki/index.php/Main_Page), a brute-force deterrent that blocks threats through firewalld. These two components act in tandem to keep your server secure while exercising some intelligence. Rampart is for ephemeral blocks that automatically expire after a fixed duration (see [network/setup-firewall](https://github.com/apisnetworks/apnscp-playbooks/tree/master/roles/network/setup-firewall)) whereas a separate firewalld permanent whitelist/blacklist is provided.

During installation, ApisCP will detect the connected IP address and whitelist it to avoid triggering a block by fail2ban, for example if you forget your password multiple times. If your IP address changes or you setup ApisCP from behind a proxy, then you can easily update the whitelist with `cpcmd`

```bash
cpcmd scope:set rampart.fail2ban-whitelist '1.2.3.4'
```

To view active fail2ban whitelists use [scope:get](https://api.apiscp.com/class-Config_Module.html#_get):

```bash
cpcmd scope:get rampart.fail2ban-whitelist
```

Whitelists may be IP address (64.22.68.1) or CIDR range (64.22.68.1/24). `rampart.fail2ban-whitelist` is an append-only operation. Edit `/etc/fail2ban/jail.conf` by hand to remove old IP addresses.

![Firewall overview](./images/firewall-diagram.svg)

## Whitelisting

ApisCP restricts access to all ports except for well-known services (HTTP, FTP, mail, SSH) and optional services (CP, user daemons). A second whitelist, which allows access to blocked ports as well as overrides Rampart can be set using `cpcmd rampart:whitelist`:

```bash
cpcmd rampart:whitelist 192.168.0.1/24
```

These entries are permanent and supersede enforcement by fail2ban. A whitelist may be removed by specifying *remove* as the second parameter, e.g. `rampart:whitelist '192.168.0.1/24' 'remove'`

::: tip
Single quotes are not compulsory, but help the shell (Bourne shell) discriminate between boundary arguments. Certain metacharacters, such as $, (, ), ;, and | have special meaning.
:::

### Delegated Whitelisting

Site Administrators can whitelist a limited number of IP addresses by through **Account** > **Whitelisting**. This value can be toggled per-site by adjusting *rampart*,*max*. If set to `DEFAULT` it inherits *rampart*,*max* service value. A few specific values for *rampart*,*max* imply specific meanings:

- `-1`: unlimited whitelisting entries (OS limit)

- `0`: disable whitelisting

- `> 0`: up to n whitelist entries

A whitelist trumps all other filters, including blacklists. **Delegated whitelisting is hierarchically equivalent to an administrative whitelist** via `cpcmd rampart:whitelist`. Each whitelist entry is held by a site. These values are codified in *rampart*,*whitelist* as a list of IPv4/IPv6 addresses. When a site is deleted, the whitelist is not released until all sites that hold a reference to the whitelist have been removed.

```bash
# Permit 20 whitelisted IPs to domain.com
EditDomain -c rampart,max=20 domain.com
# Allow otherdomain.com unlimited access
EditDomain -c rampart,max=-1 otherdomain.com
```

Additionally, `rampart:whitelist()` (without arguments) allows the caller to whitelist its public IP if not previously whitelisted. `rampart:temp($ip = null, $duration = 7200)` works similarly with a temporary whitelisting that deauthorizes after the set interval (*default: 7200 seconds*). These features may be invoked with [Beacon](https://github.com/apisnetworks/beacon) to simplify batch scripting with dhcp clients.


## Blacklisting

A blacklist exists to explicitly deny addresses that are not blocked by Rampart's adaptive firewall.

```bash
cpcmd rampart:blacklist 192.168.0.10
```

Blacklists are lower priority than whitelist and higher priority than fail2ban. CIDR ranges also work and can be fed lists for example from [IPdeny](http://www.ipdeny.com/ipblocks/):

```bash
curl -o- http://www.ipdeny.com/ipblocks/data/countries/cn.zone | while read -r IP ; do cpcmd rampart:blacklist "$IP" ; done
```

All blacklist listings are permanent unless removed with `cpcmd rampart:blacklist($ip, 'remove')`.


## Components

A **service filter** inspects a log for offending activity. A **service accumulator** is a counter internal to fail2ban that keeps track of offending activity per IP and filter over a duration. Once this threshold is reached, a ban is placed on the IP for all ports configured for that filter.

Service accumulators by default permit 3 attempts (`f2b_maxretry`) in a 5 minute period (`f2b_findtime`). Additional failures result in a 10 minute ban (`f2b_bantime`). These values may be altered in Bootstrapper.

```bash
# Change monitoring interval to 15 minutes for Dovecot
cpcmd scope:set f2b_dovecot_findtime 900
# Change bantime for SSH to 1 hour
cpcmd scope:set f2b_sshd_bantime 3600
# Change malware trigger threshold to 5 hits
cpcmd scope:set f2b_malware_maxretry 5
# Apply settings
upcp -sb fail2ban/configure-jails
```

Per-service accumulators may be set specifying `f2b_` + *filter name* + _ + *accumulator var*. For example, to change the bantime setting for "dovecot" filter to 300 seconds:

```bash
cpcmd scope:set cp.bootstrapper f2b_dovecot_bantime 300
upcp -sb fail2ban/configure-jails
```

**Service filters** are available in /etc/fail2ban/filter.d. Each jail in the next section uses a single filter to monitor for bad activity.

### Jails

A variety of jails provide granular protection over public services. The following table summarizes these jails.

| Jail         | Port protection     | Role                            |
| ------------ | ------------------- | ------------------------------- |
| dovecot      | 110, 995, 143, 995  | IMAP/POP3 failures              |
| evasive      | 80, 443             | HTTP brute-force                |
| malware      | 80, 443             | HTTP uploads containing malware |
| mysqld       | 3306                | Remote MySQL failures           |
| pgsql        | 5432                | Remote PostgreSQL failures      |
| postfix      | 25, 587, 465        | Anomalous SMTP traffic          |
| postfix-sasl | 25, 587, 465        | SMTP (SASL auth) failures       |
| recidive     | ALL PORTS           | Recurrent failures              |
| spambots     | 25, 587             | Known bad SMTP fingerprints     |
| sshd         | 22 (or `sshd_port`) | SSH failures                    |
| vsftpd       | 20, 21, 989, 990    | FTP failures                    |

### Recidivism

"Recidivism" is a specific term derived from fail2ban's [recidive jail](https://wiki.meurisse.org/wiki/Fail2Ban#Recidive) for repeat offenders. If a user repeats a ban across any monitored service 5 times (`f2b_recidive_maxretry`) in 12 hours (`f2b_recidive_findtime`), then a 10-day ban (`f2b_recidive_bantime`) is applied. Values may be altered by changing the parenthesized value with a [Scope](admin/Scopes.md).

```bash
# Ban recidive offenders for 1 month
cpcmd scope:set cp.bootstrapper f2b_recidive_bantime $((86400*30))
upcp -sb fail2ban/configure-jails
```

## Unbanning IP addresses

All IP addresses automatically unban from Rampart after a fixed duration. To manually unban an address from Rampart use cpcmd:

```bash
# Ban 192.168.0.4 in recidive, which is a long-term ban > 1 week
cpcmd rampart:ban 192.168.0.4 recidive
# Validate which jails 192.168.0.4 is present in
cpcmd rampart:is-banned 192.168.0.4
# Unban 192.168.0.4 from all jails
cpcmd rampart:unban 192.168.0.4
```

Permanent blacklist and whitelist entries can be removed with firewall-cmd

```bash
# Add 192.168.0.4 to the permanent whitelist
cpcmd rampart:whitelist 192.168.0.4
# Show all whitelist entries
ipset list whitelist
# Remove 192.168.0.4 from whitelist
cpcmd rampart:whitelist 192.168.0.4 remove
```

## Public backdoor

ApisCP provides many means to unban an IP address for a legitimate user:

1. Delegated Whitelisting as described above
2. [cp-proxy](https://github.com/apisnetworks/cp-proxy), if the proxy is installed on non-hosting server
3. Automatic expiry as discussed in **Service filters**
4. Whitelisted access to ApisCP on 2083 when `always_permit_panel_login` is `True` (disabled by default). A Scope, `cp.whitelist-access` exists to facilitate this. See [SECURITY.md](SECURITY.md) for security implications, specifically the Rampart subsystem of ApisCP that guards panel access.

