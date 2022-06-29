# Mass hosting

Notes on mass hosting, servers in excess of 500+ sites.

## Enabling data center mode

Data center mode opens up a few additional features in ApisCP intended for mass hosting including per-file InnoDB tables, remote database access, Postfix SMTP banner identification, and centralized postscreen usage.

```bash
# Enable data center mode
cpcmd scope:set cp.bootstrapper data_center_mode true
upcp -b
```

## Raising inotify watchers

Each site may run its own crond process when *crontab*,*permit=1* via Dev > Task Scheduler. Each crond service attaches an inotify watcher to each spool file in /var/spool/cron to detect changes and reload crond accordingly.

CentOS sets a default of 128, which if hit will generate spurious "Too many open files" messages (syserr EMFILE). This can be confirmed by trying to start any service: `systemctl restart atd`.

ApisCP raises this limit to 256, but may need to be higher depending on needs.

`sysctl -w fs.inotify.max_user_instances=512`

Settings may be saved by creating a file in /etc/sysctl.d, e.g.

`echo "fs.inotify.max_user_instances=512" > /etc/sysctl.d/Zinotify.conf`

Any file lexicographically greater than "apnscp.conf" will override these settings.

## Table definition cache/prepared statements

Prepared statements may fail with errno 1615: "*Prepared statement needs to be re-prepared*". This occurs when a significant number of tables exist in the data dictionary.

From the command-line, run

```bash
mysql
SET GLOBAL table_definition_cache=16384;
```

If the error resolves, this is due to the [table definition](https://dev.mysql.com/doc/refman/5.6/en/server-system-variables.html#sysvar_table_definition_cache) limit of 4096 being reached. Changes may be made permanent by adding `table_definition_cache=16384` under the **[mysqld]** section in `/etc/my.cnf.d/server.cnf` or any file lexicographically higher than "apnscp.conf".

## fail2ban extended startup

Hosting more sites creates more opportunity for indiscriminate attacks. [Rampart](../FIREWALL.md) continuously blocks threats, logging to fail2ban to replay its activity if the server were to reboot. "recidive" is a long-term ban list for repeat offenders that accumulates significant entries over its 10 day duration, sometimes up to 10,000 while other short-term ban lists may have a few dozen entries at a time. Whenever fail2ban starts (or restarts), this ban list is recreated from entries in `/var/log/fail2ban.log` that can create additional resource contention between CPU/disk that amplifies a thundering herd problem among other services, including per-site PHP-FPM pools that can number in the several hundreds.

fail2ban can be configured to tail `/var/log/fail2ban.log` on startup, that is to say instead of replaying the entire log just monitor for new entries. Instead of parsing 100k+ lines only new lines are parsed that can reduce the cumulative burden on startup. 

Existing bans in the database will still be applied on startup, but these bans are replayed with less rigor that may create omissions in the "recidive" ban list.

```bash
cpcmd scope:set cp.bootstrapper f2b_recidive_tail true
upcp -sb fail2ban/configure-jails
```