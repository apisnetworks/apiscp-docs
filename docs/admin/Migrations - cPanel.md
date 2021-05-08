---
title: cPanel migrations
alias: migrations
---

# Migration procedure

`ImportDomain` consists of two stages, account creation and file migration. Stages may be selectively run. Migrations allow fast restoration into ApisCP. Better yet, ApisCP can be used with [PowerDNS integration](https://github.com/LithiumHosting/apnscp-powerdns) to share DNS servers with cPanel as you transition over.

[![asciicast](https://asciinema.org/a/260493.svg)](https://asciinema.org/a/260493)

## Components

- Import account metadata from cp
    \- Apply plan from PLAN=
    \- Preserve STARTDATE=, DEMO=,
    \- Copy storage/bandwidth/domain limits
- SSL certificates
- Cronjobs
- Users, quota limits, passwords
    \- Each user assigned unique user ID
    \- Conflicting email addresses by default fail, set `--conflict=merge` per [Merge Policy](https://hq.apiscp.com/cpanel-apnscp-migration/#email-conflict)
- Email aliases, forwards
    \- Conflict policy applies
- Restores inboxes and files within /homedir
- Addon domains, parked domains (aliases to primary domain)
- MySQL databases, users (override conflict with `-c mysql,dbaseprefix`)
- DNS change on migration, disable with `--no-activate`
- Automatic Web App scan + enrollment in nightly updates (`--no-scan`disables)
- Add last login IPs to delegated whitelist if platform version supported (v8+, see [Caveats](https://hq.apiscp.com/cpanel-apnscp-migration/#caveats) section)
- Translate paths for web-accessible files
- Convert Mailman mailing lists to Majordomo
- Migrate SquirrelMail address books and user preferences

## Basic usage

```bash
ImportDomain --format=cpanel /path/to/cpmove-backup.tar.gz
```

::: danger
Never run ImportDomain where the decompressed backup source is in the current working directory. `ImportDomain --format=cpanel ./` will force a terminal logout as it relocates the backup and closes are open file handles to prevent tampering during restore.
:::

## Account creation

An import will faithfully restore whatever options were used in creation. Conflicts may arise and can be remedied by overriding creation options using `-c service,parameter=value`. For example to remove a domain limit imposed by `MAXADDON=` (*addon and parked domains are same to ApisCP*) and change the storage to 10 GB in a restore,

```bash
ImportDomain -c aliases,max=None -c diskquota,quota=10 -c diskquota,units=G --format=cpanel /path/to/cpmove-backup.tar.gz
```

### Dumping parsed configuration

`--dump` will dump the configuration inferred from the backup.

```bash
ImportDomain --format=cpanel --dump /path/to/cpmove-backup.tar.gz
```

Sample response:

```yaml
siteinfo:
    plan: basic
    email: matt@apnscp.test
    domain: apnscpbackup.test
    admin_user: atest
bandwidth:
    threshold: 104857600000
    units: B
diskquota:
    quota: !!float 3000
    units: MB
aliases:
    max: null
```

## Account import

Import occurs following creation. **Import is destructive.** Any users in conflict or directories in conflict with the backup will be removed during the import stage. Use `--no-create` to bypass creation and perform just data import.

```bash
ImportDomain --format=cpanel --no-create /path/to/cpmove-backup.tar.gz
```

### Email conflict

Each email account is delivered to a separate user account. Partitioning email into distinct user accounts ensures that an account may have multiple distinct users and each of these users is protected from snooping by other users on the account. Such a format conflicts with cPanel's single UID approach. ApisCP has a few solutions to remedy:

| Method     | Existing Email | Conflicting Email | Final User          |
| ---------- | -------------- | ----------------- | ------------------- |
| fail       | foo@a.com      | foo@b.com         | n/a, terminate task |
| merge      | foo@a.com      | foo@b.com         | foo                 |
| namespaced | foo@a.com      | foo@b.com         | foo-b               |

Conflict strategy may be specified with `--conflict=method`. The default method is *fail*.

#### Forwarded catch-alls

ApisCP does not allow catch-alls to be forwarded from a server (rationale: the receiving server should act as the MX for that domain). Encountering a forwarded catch-all in the backup will force ApisCP to fail migration as it breaks fidelity. Specify `--drop-forwarded-catchalls` to disable any catch-alls that forward to another address.

To allow forwarded catch-alls, set *[mail]* => *forwarded_catchall* to true: `cpcmd scope:set cp.config mail forwarded_catchall true`.

### Web Apps

Web Apps emphasize principle of least-privilege where possible, meaning the Web App system files run separate from the user that PHP runs as. If the web server requires write access to any Web App, permission problems may arise. Two methods exist to resolve this,

- Set `apache,webuser=None` during account creation. This will force the PHP-FPM worker to run as the account admin as is seen on cPanel/Plesk platforms. Doing so negates the benefits of [Fortification](Fortification.md) but may be seen as a quick fix.
   e.g. `ImportDomain -c apache,webuser=None --format=cpanel /cpanel/backup.tar.gz`
- Set a Fortification profile to be applied to all detected Web Apps. Valid modes include: max, min, and release; "release" allows carte blanche write access to the document root and its descendents. This may be specified using `--apply-fortification=PROFILE` during migration.

### Bypasses

#### DNS import
**New in 3.2.24**

DNS records are read from backup as-is. To bypass any DNS record importation relying instead on ApisCP-generated records, add `--no-dns`.

#### DNS activation

DNS will update to the current server at conclusion of import. This behavior may be disabled by passing `--no-activate` to `ImportDomain`. `--no-dns` implies this.

#### Web App scan/update

Once an import concludes, the filesystem is scoured for known web apps to be enrolled in nightly automatic Web App updates (core: nightly, assets: Wednesday/Sunday). Use `--no-scan` to prevent this behavior.

#### Let's Encrypt Bootstrap

Following migration, ApisCP will attempt to request SSL for each hostname as well as a wildcard certificate for subdomains up to 3 times over the next 48 hours. SSL bootstrapping enqueues a job, which takes up ~100 KB for each site. `--no-bootstrap` disables SSL bootstrapping.

### Deleting backup after import

`--delete` will discard the import after a successful backup.

### Resetting plan spec

`--reset` applies the configured plan specification to the site following import. Honoring backup metadata from the backup is a behavior of cPanel preserved in the interest of achieving consistency. Signed backups generated within ApisCP prevent tampering with account data.

### Dry-runs

`--dry-run` enables a dry-run on import. Depending upon the leg and flags, this may:

- Similar to `--dump` when `--no-create` is NOT present
- Mixed with `--reset`, similar to `EditDomain --dry-run --reset`
- No behavior when used with `--no-create`

### Importing webmail configuration

`--unsafe-sources` allows importing unchecked, potentially hazardous, backup data including SquirrelMail preference files and Roundcube MySQL directives. The consistency and validity of this data is not checked. **Do not enable this option unless you are confident the backup has not been tampered with**.

### Quota disagreements

Quotas are accounted and enforced by the kernel. When migrating from certain hosting platforms that employ quasi-quota accounting by software, such as cPanel, the reported quota for a user may be significantly more than what was previously reported. `--late-quota` will apply storage amnesty, which is a 2x storage boost for 12 hours. **Late quota is only triggered** after account creation. Thus when combined with `--no-create`, `--late-quota` has no effect. Call `site:storage-amnesty` against the account using [cpcmd](CLI.md#cpcmd).

Storage amnesty is controlled in config.ini. The following [Scopes](Scopes.md) will change the boost from 2x to 3x and duration from 12 hours to 48 hours:

```bash
cpcmd scope:set cp.config quota storage_boost 3
cpcmd scope:set cp.config quota storage_duration 172800
```

These changes will be reflected on future imports.

### Decompression oddities

Migration will attempt to use PHP's PharData handler to decompress files. It's based on USTAR, which has [limitations](https://www.gnu.org/software/tar/manual/html_chapter/tar_8.html) that may result in a cPanel backup generated in POSIX.1-2001 standards to fail. Use `--no-builtin` to disable the builtin handler from attempting to read the backup.

## Two-stage migrations

A two-stage migration is a conservative technique to allow users to preview their domains before committing to the finalized migration. This allows unlimited time for a user to [preview](https://kb.apiscp.com/dns/previewing-your-domain/) their domain. `change_dns.php` may be used to update DNS once changes have been finalized.

```bash
ImportDomain --format=cpanel --no-activate /mydomain.tar.gz
/usr/local/apnscp/bin/scripts/change_dns.php -d mydomain.com --old=CPANELIP
# wait 24 hours and pull an updated backup
ImportDomain --format=cpanel --no-create /mydomain-updated.tar.gz
/usr/local/apnscp/bin/scripts/change_dns.php -d mydomain.com --old=CPANELIP --new="$(cpcmd -d mydomain.com dns:get-public-ip)"
```

## Bypassing creation

`--no-create` is intended to copy data from an already provisioned account on an ApisCP platform. Consequently, `--no-create` is intended to refresh data such that it:

- **will not** remove or alter existing users on the import destination
- **will not** update email addresses present on both destination and source
- **will** create email addresses present on source not present in destination
- **will** replace database contents and user grants with source if destination and source exist
- **will** update files present on both source and destination with source if changed
- **will not** remove files on destination not present on source

## Simple cPanel migration example

- On the new ApisCP server, create a`/migrations` folder
- On the old cPanel server, run ssh-keygen and don't set a password (this is temporary)
- `cat /root/.ssh/id_rsa.pub` and put that on the new server in `/root/.ssh/authorized_keys`

Then on the old server, use this script

```bash
#!/usr/bin/env bash
ACCOUNTS=(account1 account2 account3)
DEST=newserver.apiscp.test
for account in ${ACCOUNTS[@]}; do
    /scripts/pkgacct --allow-override --backup --skipapitokens --skipbwdata --skipintegrationlinks --skiplocale --skiplogs --skipresellerconfig $account /backup
    rsync -v -e ssh /backup/$account.tar.gz root@$DEST:/migrations/
    rm -f /backup/$account.tar.gz
done
```

- Replace the accounts with the name of accounts you want to migrate and it will package them up and dump them in the migrations folder on the new server.
- Then you can run the importer on the new server and update your nameservers.

It's crude but it works, could also be further automated but I wanted to have more control.
when you're done, delete the SSH key and remove from authorized_keys

## Caveats

- ApisCP has no notion of a "parked domain". The maximum number of addon domains is the max of MAXADDON and MAXPARK.
- Accounts are multi-tenant. Each mailbox is a separate user account. In multi-domain layouts duplicate email addresses can be merged into a single user account or separated into distinct user accounts. Default policy is to *fail* when a conflict is encountered. Specifying `--conflict=merge` or `--conflict=namespaced` will merge duplicate addresses or split addresses into separate user accounts when encountered.
- "test" accounts are not permitted. When transitioning from cPanel to ApisCP, each email account is assigned to a distinct user account in the system. If there are a variety of "test" emails at least 1 "test" email will create a "test" user; this is illegal and will cause the backup to fail. These accounts are typically one-offs that are created to validate if an account works utilizing very weak credentials. If you plan on utilizing a test@domain email address, create one that maps to a user named anything other than "test" once the backup completes.
- Forwarding behavior is incompatible with ApisCP. Autoresponders are determined by user account, not email account (email delivers to user accounts). Autoresponders will be converted to forwards to their respective user account.
- ApisCP uses Postfix for handling mail. Exim mail filters are incompatible with ApisCP.
- Database and account passwords are separate. cPanel does not store the database password anywhere instead relying on storing the password in the active session for phpMyAdmin SSO. SSO will not function until the user updates the password via **Databases** > **phpMyAdmin**. For added security, the password should be changed to something different than the panel password via **Databases** > **MySQL Manager**. Doing so will also update the stored password in `~/.my.cnf`.
- Mailing lists use Majordomo. cPanel uses mailman. There are incompatibilities in how these lists are transferred and used. Each mailing list name must be unique.
- Certain .htaccess directives referencing an absolute path on import source may not convert correctly. This is due to Apache and application services (PHP-FPM, CGI, Python, Ruby, Node) operating with different visibility. See [Apache.md](Apache.md).
- Path migrations remain untouched in MySQL and PostgreSQL exports. Presently there isn't an inexpensive way to perform this task.

## To-do

- [ ] PostgreSQL user/database
- [ ] Horde, SQLite to MySQL conversion
