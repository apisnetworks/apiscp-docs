---
title: Server transfers
---

ApisCP provides an automated migration system to assist you in moving accounts from system to system and platform to platform. There are a few prerequisites to confirm before migrating:

- ✅ You have root (administrative) access on both servers
- ✅ Public key authentication is configured on the destination server
- ✅ Both source + destination run ApisCP
- ✅ Source + destination server have DNS configured (*optional*)

As long as the account fits this checklist, you're golden! To initiate migration, issue the following command:

```bash
apnscp_php /usr/local/apnscp/bin/scripts/transfersite.php -s <newserver> <domain>
```

Where `<newserver>` is the destination server, a fully-qualified domain isn't necessary, and `<domain>` is the domain name, site identifier (siteXX), or invoice grouping to migrate. For example, if a server has 3 accounts run by Ted with the billing grouping "tedsite" via `billing`,`invoice`/`billing`,`parent_invoice` in its service definition, then the following will kickoff 3 migrations in serial for Ted's sites to the server with the hostname `newsvr.mydomain.com`:

```bash
apnscp_php /usr/local/apnscp/bin/scripts/transfersite.php -s newsvr.mydomain.com tedsite
```

As long as DNS is configured for the site and the target server has the same DNS provider configured, then migration will be fully automated with an initial stage to prep files and give a 24 hour window to [preview the domain](https://kb.apiscp.com/dns/previewing-your-domain/). If DNS isn't configured for a site, (`dns`,`provider`=`builtin`), then an optional parameter, `--stage`, can be provided to set the migration stages.

- Stage 0: initial creation
- Stage 1: second sync
- Stage 2: site completed

Stage 2 is a no-op; the site is considered migrated.

```bash
apnscp_php bin/scripts/transfersite.php --stage=0 newsvr.mydomain.com tedsite
```

To skip creation as a site, for example if an intermediate stage fails, then `--no-create` can be specified to skip creation on when stage is 0.

## Migration components

ApisCP migrates sites by component. Available components may be enumerated using, `--components`

*Stages*

- users
- passwords
- sql_databases
- sql_users
- mysql_users
- pgsql_users
- sql_schema
- addon_domains
- subdomains
- email_domains
- mailing_lists
- files
- mailboxes
- crons
- vmount
- dns
- http_custom_config
- letsencrypt_ssl
- mysql_schema
- pgsql_schema

Some components accept arguments, such as *files* in which case typical ApisCP syntax applies. Component arguments are delimited by a comma:

```bash
apnscp_php bin/scripts/transfersite.php --do=files,'[/var/www]' mydomain.com
```

Reruns file migration on /var/www for mydomain.com. Upon completion the stage won't be updated.

Multiple stages can be run by specifying `--do` multiple times.

```bash
apnscp_php bin/scripts/transfersite.php --do=addon_domains --do=subdomains mydomain.com
```

## Overriding configuration

Site configuration can be overridden during stage 0 (account creation). This is useful for example if you are changing VPS providers, while retaining the respective provider's DNS service. `-c` is used to specify site parameters as is commonly repeated in [cPanel imports](/admin/Migrations%20-%20cPanel) or [site creation](/admin/Plans/#adddomain).

```bash
apnscp_php bin/scripts/transfersite.php -c='dns,provider=linode' -c='dns,key=abcdef1234567890' mydomain.com
```

On the source server, mydomain.com may continue to use DigitalOcean as its [DNS provider](https://bitbucket.org/apisnetworks/apnscp/src/master/lib/Module/Provider/Dns/Digitalocean.php?at=master&fileviewer=file-view-default) while the on the target server mydomain.com will use Linode's [DNS provider](https://bitbucket.org/apisnetworks/apnscp/src/master/lib/Module/Provider/Dns/Linode.php?at=master&fileviewer=file-view-default). Once mydomain.com completes its initial stage (stage 0), be sure to update the nameservers for mydomain.com.

## Notification templates

A notification is sent at the end **stage 0** (warmup migration) and **stage 1** (final migration). Migrations are read from `resources/templates/migrations/` and may be overrode following [view/template](Customizing.md#ApisCP) override rules.

Custom templates may be specified using `--template=`. A single argument or CLI

## Skipping suspension

An account after migration completes is automatically suspended on the source side. In normal operation, this poses no significant complications as DNS TTL is reduced to 2 minutes or less during stage one migration.

`--no-suspend` disables suspension following a successful migration. 

## Migration internals

ApisCP uses DNS + atd to manage migration stages. A TXT record named `__acct_migration` with the unix timestamp is created on the **source** server. This is used internally by ApisCP to track migration. ApisCP creates an API client on both the **target** and **source** servers. A 24 hour delay is in place between migration stages to allow DNS to [propagate](https://kb.apiscp.com/dns/dns-work/) and sufficiently prep, including [preview](https://kb.apiscp.com/dns/previewing-your-domain/), for a final migration. This delay can be bypassed by specifying `--force`. All resolvers obey TTL, so don't force a migration until the minimum TTL time has elapsed!

Migration TTLs are adjusted on the **target** server to 60 seconds. If you are changing DNS providers during migration, this will allow you to make nameserver changes without affecting your site. On its inital migration (stage 0), ApisCP copies all DNS records verbatim to the **target**. At the end of the second migration stage (stage 1), all records that match your old hosting IP address are updated to your new IP address. All other records *are not* altered. Additionally, `__acct_migration` is removed from the **source** DNS server and account put into a suspended state. When both **source** and **target** share the same nameserver, only TTL is reflected at the end of stage 0 and IP address changed at the end of stage 1. At the end of stage 1, TTL is reset to the default TTL setting.

::: tip
Setting records, TTL adjustments on the target machine allows you to proactively update nameservers before a migration finalizes if you are unable to modify DNS records on the source machine. The initial records during stage 1 will reflect the *source* server while stage 2 records reflect the *target* server.
:::

### Further reading

- [Migrating to another server](https://kb.apiscp.com/platform/migrating-another-server/) (kb.apiscp.com)
