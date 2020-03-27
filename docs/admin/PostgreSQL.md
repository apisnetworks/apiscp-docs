# PostgreSQL

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

