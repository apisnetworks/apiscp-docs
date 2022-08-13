# Nextcloud

::: tip
Part of the Web Apps family, Nextcloud supports many familiar components shared by all other apps. See [WebApps.md](../WebApps.md) for preliminary information that covers the *update process*.
:::

## Configuration

### trusted_domain

The first position in `trusted_domain` is reserved for the domain under which Nextcloud is installed. It may be changed by reconfiguring the hostname via `nextcloud:reconfigure domain.com path migrate newdomain.com`.

## utf8mb4 support

ApisCP ships with `innodb_file_per_table` disabled by default as historically per-file tables restricted by kernel quotas may - in rare instances - result in [unpredictable crashes](../admin/MySQL.md#cyclic-innodb-crash) or corruption. It may be enabled in [data center mode](../Mass hosting.md#enabling-data-center-mode) or individually using Bootstrapper:

```bash
cpcmd scope:set cp.bootstrapper mysqld_per_account_innodb true
upcp -sb mysql/install
```

Nextcloud installations will now use utf8mb4 as its default character set a storage increase of 33% (3 bytes vs 4 bytes per character).