# Firewall

ApisCP utilizes [firewalld](https://firewalld.org/) for its firewall. Rampart is a module that serves as a wrapper for [fail2ban](https://www.fail2ban.org/wiki/index.php/Main_Page), a brute-force deterrent that blocks threats through firewalld. These two components act in tandem to keep your server secure while exercising some intelligence. Rampart is for ephemeral blocks that automatically expire after a fixed duration (see [network/setup-firewall](https://github.com/apisnetworks/apnscp-playbooks/tree/master/roles/network/setup-firewall)) whereas a separate firewalld permanent whitelist/blacklist is provided.

During installation, ApisCP will detect the connected IP address and whitelist it to avoid triggering a block by fail2ban, for example if you forget your password multiple times. If your IP address changes or you setup ApisCP from behind a proxy, then you can easily update the whitelist with `cpcmd`

```bash
cpcmd scope:set rampart.whitelist
```

To view active whitelists use [scope:get](https://api.apiscp.com/class-Config_Module.html#_get):

```bash
cpcmd scope:get rampart.whitelist
```

Whitelists may be IP address (64.22.68.1) or CIDR hosts (64.22.68.1/24). rampart.whitelist is an append-only operations. Edit /etc/fail2ban/jail.conf by hand to remove old IP addresses.

## Whitelisting access

ApisCP restricts access to all ports except for well-known services (HTTP, FTP, mail, SSH) and optional services (CP, user daemons). A second whitelist, which allows access to blocked ports as well as overrides Rampart can be set using `cpcmd rampart:whitelist`:

```bash
cpcmd rampart:whitelist 192.168.0.1/24
```

These entries are permanent.

## Blacklisting

Likewise a blacklist exists to block addresses that are not blocked by Rampart's adaptive firewall. 

```bash
cpcmd rampart:blacklist 192.168.0.10
```

Blacklists are lower priority than whitelist and Rampart blocks.

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

