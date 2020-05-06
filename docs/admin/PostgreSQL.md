# PostgreSQL

PostgreSQL version is determined at installation time via `pgsql_version`. Changing minor versions on a production server is ill-advised, instead consider migrating to another ApisCP platform using the [migration tool](Migrations%20-%20server.md). Patch releases (11.3 => 11.4) are supported and deployed automatically without issue.

## Namespacing

All accounts are prefixed with a database namespace. In service metadata, this value is *pgsql*,*dbaseprefix*. A prefix must end with an underscore ("_"). If not supplied, it will be automatically generated from the primary domain on the account. 

A prefix can be adjusted a couple ways. First, if *[auth]* => *allow_database_change* is enabled ([Tuneables.md](Tuneables.md)), then Site Administrators may change it under **Account** > **Settings**. If this value is disabled, then the Appliance Administrator may change the prefix either in **Nexus** or from the command-line using [EditDomain](Plans.md#editdomain).

```bash
# Change the prefix to "foo_"
EditDomain -c pgsql,dbaseprefix=foo_ bar.com
```

When a prefix is changed, all authentication details must be updated to reference the new prefix. These **are not updated** on prefix change.

## Enabling remote connections

`data_center_mode` is a [Bootstrapper](Bootstrapper.md) setting that opens remote access to PostgreSQL. Once opened, PostgreSQL is protected by [Rampart](Rampart.md). `data_center_mode` opens up remote PostgreSQL access in addition to a slew of other features. If you'd like to just open PostgreSQL, use the **pgsql.remote-access** [Scope](Scopes.md).

## Troubleshooting

### Upgrading PostgreSQL

It is not advised to upgrade PostgreSQL major versions, e.g. 11 -> 12. Instead, migrate the sites to another server using automated [server-to-server](Migrations - server.md) migrations. Upgrade-in-place requires exporting the database via `pg_dumpall` then importing following upgrade.

PostgreSQL version may be chosen at install time using the ApisCP [Customizer](https://apiscp.com/#customizer).


### Pruning WAL

Write-ahead logging ensures data integrity in PostgreSQL. Once written to the WAL, data may then be committed to database. WAL logs are automatically expired by PostgreSQL, but in the event of improper configuration may quickly grow to exceed reasonable storage limits.

Before doing so, consult /var/lib/pgsql/XX/data/postgresql.conf settings, specifically max_wal_size and [min_wal_size](https://www.postgresql.org/docs/12/wal-configuration.html).

::: danger
**This is considered very risky. There is a risk of permanent data loss. Do not proceed unless absolutely necessary.**
:::

The following interaction assumes PostgreSQL 11 is installed. 11 would change to 10 or 12 as appropriate.

```bash
systemctl stop postgresql
systemctl stop monit
# Find the last pg_wal or maybe last few, by recent timestamp
/usr/pgsql-11/bin/pg_archivecleanup -n /var/lib/pgsql/11/data/pg_wal/00000001000002320000007E
# Delete all records older than
/usr/pgsql-11/bin/pg_archivecleanup -d /var/lib/pgsql/11/data/pg_wal/00000001000002320000007E
# Now your database is toast because the WAL indicator has vanished
# Shows the WAL log
/usr/pgsql-11/bin/pg_resetwal  -n /var/lib/pgsql/11/data/
# Reset WAL
/usr/pgsql-11/bin/pg_resetwal  /var/lib/pgsql/11/data/
systemctl start postgresql
systmectl start monit
```

