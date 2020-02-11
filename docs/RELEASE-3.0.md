---
title: "3.0"
---

apnscp v3.0, sponsored by project creep, has been released. This is the first public major release after [16 years](http://old.apisnetworks.com/apnscpyears.php) of development. All major milestones have been implemented, including experimental preview of [rspamd](https://hq.apnscp.com/filtering-spam-with-rspamd/), a vastly superior spam filtering engine, that will power DKIM/ARC signing as well as rate-limiting outbound mail in future releases of apnscp.

A new migration play has been shipped with this announcement that automatically changes the apnscp update policy from `edge` to `major`, which will check for and deploy updates up to the major version. 3.0.0 -> 3.0.1 and 3.0.1 -> 3.1.0 will process automatically. 3.1.0 to 4.0.0 will be blocked. Set `apnscp_update_policy` to `edge` to continue to receive the latest nightly code. apnscp.update-policy is a shortcut command to this [Bootstrapper setting](https://github.com/apisnetworks/apnscp-playbooks/blob/47f68ab42de210368a8d9664dc7ae611e13419e7/apnscp-vars.yml#L44:L50). If you're a few updates behind, do this after updating the panel.

```bash
upcp -b
cpcmd config_set apnscp.update-policy edge
```

New trial licenses will be valid for 60 days during a 15-day transitional grace period, after which time new licenses will be issued with a 30 day trial. All expiring licenses must be converted to a paid license within [my.apnscp.com](https://my.apnscp.com/)'s user portal (**Settings** > **Licenses**). A conversion facility will be up no later than February 15. You may reach out to me directly at [matt@apisnetworks.com](mailto:matt@apisnetworks.com) for license conversions until then.

apnscp lifetime licenses are on sale for $129 to celebrate this release. The regular retail price afterwards will be $249 for a lifetime or $10/month for pay-as-you-go. Head on over to the client area of [my.apnscp.com](https://my.apnscp.com/) to get started.

👉 As with all former releases, refer to the v3.0 [pre-alpha technical release announcement](https://hq.apnscp.com/apnscp-pre-alpha-technical-release/) for installation and usage. 👈

For existing installations, apnscp will update automatically overnight as long as `apnscp_nightly_update` is enabled (default: yes). If you disabled automatic updates or are many versions behind, update apnscp manually with:

```bash
upcp -b
```

## Important changes

- [rspamd](https://hq.apnscp.com/filtering-spam-with-rspamd/) + [SRS](http://www.openspf.org/SRS) support. SRS reforms a forwarded email's envelope to match the forwarding server. Fixes DKIM/SPF problems with forwarded messages
- Virus scan support in **Web** > **Web Apps** when `clamav_enabled` [is set](https://github.com/apisnetworks/apnscp-playbooks#low-memory-mode)
- `upcp` supports running components, e.g. `upcp -b mail/rspamd`
- mod_evasive configuration scope, `cpcmd config_get apache.evasive`
- Auto-learn feature by dragging mail in/out of Spam folder
- Argos supports several new [backends](https://hq.apnscp.com/monitoring-with-monit-argos/), including Slack
- Bootstrapper override support (/root/apnscp-vars-runtime.yml), `cpcmd config_get apnscp.bootstrapper`
- Sticky workers - apnscpd will reuse a hot session if possible to eliminate reinitialization overhead

Even though the beta was determined to be the final incremental release before 3.0 final, this release includes over 450 changes to polish delivery, some of which bear further mention.

![img](https://hq.apiscp.com/content/images/2019/01/rspamd-logo.png)

### rspamd

[rspamd](https://hq.apnscp.com/filtering-spam-with-rspamd/) is the biggest change over beta. SpamAssassin was the preferred method of filtering that with sufficient samples and a global Bayes database works reasonably well, but filtering is slow, integration limited, and its algorithm [brain dead](https://en.wikipedia.org/wiki/Naive_Bayes_classifier). rspamd uses Markov modeling to adaptively filter spam in an asynchronous event loop. rspamd is gentler on memory, faster (20-30x faster), and best part yet: a [milter](https://en.wikipedia.org/wiki/Milter). Milters are mail filters that speak directly with the MTA, Postfix in this case, to act as a gatekeeper for mail both inbound *and* outbound. rspamd can accept, reject, temporarily reject, and alter mail headers at connection time instead of once a message has been taken in for processing thereby rationing precious CPU cycles.

rspamd is the future of apnscp. It's released now for early testing to begin a long road of integration that will ultimately provide inbound spam filtering in addition to outbound rate-limiting, filtering, and DKIM/ARC signing to ensure mail that leaves an apnscp server is the most reputable possible.

Check out the filtering post below for a detailed explanation of usage.

- [Filtering with rspamd](https://hq.apnscp.com/filtering-spam-with-rspamd/) (hq.apnscp.com)
- [rspamd Bootstrapper vars](https://github.com/apisnetworks/apnscp-playbooks/blob/master/roles/mail/rspamd/defaults/main.yml) (github.com)

### Bootstrapper cpcmd support

`cpcmd` supports Bootstrapper overrides. Overrides are written to `/root/apnscp-vars-runtime.yml` and can be used to replace any default variable in any component of [Bootstrapper](https://github.com/apisnetworks/apnscp-playbooks). apnscp automatically infers and converts types.

For example, to enable low memory mode and update all services accordingly:

```bash
cpcmd config_set apnscp.bootstrapper has_low_memory true
upcp -b
```

To set autolearn thresholds for rspamd, use an array:

```bash
cpcmd config_set apnscp.bootstrapper rspamd_autolearn_threshold '[-2.0,15]'
upcp -sb mail/rspamd
```

Use `cpcmd config_get apnscp.bootstrapper` to list all overrides. `-b` runs Bootstrapper playbooks. `-s` bypasses code update prior to running playbooks. `mail/rspamd` or anything else afterwards restricts Bootstrapper to those named roles in [bootstrap.yml](https://github.com/apisnetworks/apnscp-playbooks/blob/master/bootstrap.yml).

### Mailbox guided learning

apnscp now ships with [sieve support](https://wiki.dovecot.org/Pigeonhole/Sieve) for IMAP mailboxes. Drag and drop mail into and out of the "Spam" folder to train messages as spam/ham respectively. By default mail that's sent to the Spam folder is automatically learned as spam, but this behavior can be quickly changed to monitor the Trash folder instead:

```bash
cpcmd config_set apnscp.bootstrapper dovecot_learn_spam_folder "{{ dovecot_imap_root }}Trash"
upcp -sb mail/configure-dovecot
```

All mail deleted from an IMAP client will be learned as spam. Refer back to `/var/log/maillog` for confirmation,

```
Jan 21 15:54:44 jib dovecot: imap(msaladna@apisnetworks.com): sieve: pipe action: piped message to program 'learn-spam.sh'
```

### Virus scans

![img](https://hq.apiscp.com/content/images/2019/01/virus-scan-feature.png)

apnscp will inspect a web app for suspicious files when ClamAV is enabled. It's disabled by default if `has_low_memory` is enabled. This can be overrode with `clamav_enabled`,

```bash
cpcmd config_set apnscp.bootstrapper clamav_enabled
upcp -b
```

An anti-virus is only as effective as its heuristics dictate, which is at the mercy of humans who recognize patterns and write heuristics to cover. That is to say an AV can only detect what it knows to detect and nothing more. It won't catch all viruses, but should provide guidance when importing a new client's Wordpress site from say Hostgator that has an [incentive](https://websitesforgood.com/beware-of-malware-scams-sitelock-hostgator-and-an-angry-web-girl/) to keep servers insecure.

`file_scan` is the corresponding low-level API command.

```bash
cpcmd -d someaccount.com file_scan /var/www/html
```

## In the pipeline

Now that 3.0 has been released, it's time to address [feature requests](https://github.com/apisnetworks/apnscp/issues) that will be implemented in 3.1. This includes support for ownCloud, TimescaleDB metrics, PHP-FPM (when `apache,jail=1` is configured for a site), Dovecot/Postfix SNI via haproxy, and block storage attachment. These will be incrementally rolled out as part of the master branch, so if you'd like to continue to receive technology as it's released, set your update policy to "edge":

```bash
cpcmd config_set apnscp.update-policy edge
```

As always if you run into any issues stop by the [forums](https://forums.apnscp.com/) or [Discord](https://discord.gg/wDBTz6V). I'll be there!

## Changelog

- REL: apnscp 3.0
- **NEW**: license upgrade (License)
- **NEW**: apnscp.update-policy, system.update-policy- set apnscp and Yum update behavior (Admin\Settings)
- **NEW**: activate_license() (admin)
- **NEW**: nextSemanticVersion(), helper to quickly locate next version in branch given literal component (Opcenter\Versioning)
- **NEW**: toggle code page conversion in File Manager. Code page characters can be optionally converted to best match when the source file is US-ASCII (Settings)
- **NEW**: memcache postscreen/address verify map support. Set postfix_memcache_server to IP address or unix domain socket. (mail/configure-postfix)
- **NEW**: apache.evasive configuration scope (Opcenter\Admin)
- **NEW**: remove package subtask (apsncp/initalize-filesystem-template)
- **NEW**: -s|--skip-code, support running specific roles in -b or -a mode, e.g. "upcp -sb mail/rspamd" skips code update, runs Bootstrapper targetting only mail/rspamd role (upcp)
- **NEW**: Filelist plugin, filter and override files returned by rpm -ql (Yum::Synchronizer)
- **NEW**: reporterror - toggle automatic error reporting of stderr if process exits with non-success code (Util_Process)
- **NEW**: Virus scan support for document root (Web Apps)
- **NEW**: getReturn()- get job return value (Lararia\Jobs)
- **NEW**: mailbox backup option (Manage Mailboxes)
- **NEW**: notes field in siteinfo service (plans)
- **NEW**: dump_mailboxes()- backup mailboxes in raw format (email)
- **NEW**: whoami()- simple method to query session validity and active user (common)
- **NEW**: scan()- scan a requested path for malware (file)
- **NEW**: implicit override support (mail/rspamd)
- **NEW**: resync FST nightly as needed (apnscp/crons)
- **NEW**: Dovecot sieve. Autolearn ham/spam on mail presence (mail/configure-dovecot)
- **NEW**: Stats module (mail/configure-dovecot)
- **NEW**: rspamd
- **NEW**: postsrsd, create new envelope for forwarded mail
- **NEW**: apnscp_update_policy, yum_update_policy: control panel/OS updates (apnscp-vars.yml)
- **NEW**: kill_site()- kill all processes on site (admin)
- **NEW**: list_commands()- enumerate all module commands (misc)
- **NEW**: filter()- ignore PCRE-compatible patterns from ER within callable scope (Error Reporter)
- **NEW**: apnscp.bootstrapper low-level configuration support (config)
- **NEW**: version_from_path()- infer Ruby interpreter from path (ruby)
- **NEW**: hierarchical subdomain sorting (Util_Conf)
- **NEW**: import JSON buffer (Error_Reporter)
- **NEW**: update_remote()- pull remote refs for rbenv versions (ruby)
- **NEW**: DNS-only license mode (Opcenter\License)
- **NEW**: sticky workers - reserve a worker spot for 30 seconds to reduce context switching (apnscpd)
- **NEW**: apnscp.debug, apnscp.workers configurables (Admin\Settings)
- **NEW**: ping() helper method, check PostgreSQL connection (postgresql)
- **NEW**: --reset, restore git tree to pristine state (upcp)
- **NEW**: backend deletion support (Opcenter\Argos)
- **NEW**: notifico, pushjet, slack, systemlog, xmpp Argos backends
- **NEW**: notifico, pushjet, slack, systemlog, xmpp Argos backends
- **NEW**: variety of argos runtime configuration options (Admin\Settings)
- **NEW**: argos module
- **NEW**: install -d flag, automatically pull in immediate package dependencies. depends action shows missing package dependencies, -r shows deep dependencies, -d sets depth limit (Yum::Synchronizer)
- **NEW**: apache.evasive-whitelist, manage mod_evasive IP address whitelisting (Admin\Settings)
- **NEW**: License app
- **NEW**: load Passenger configuration from Passengerfile.json if present (passenger)
- **NEW**: whitelist ipset (network/setup-firewall)
- **NEW**: config.ini CLI driver - config_set apnscp.config SECTION OPTION VALUE, config_get apnscp.config SECTION (Admin\Settings)
- **NEW**: ephemeral account creation, removed out of scope (Opcenter\Account)
- **NEW**: null provider (email, dns)
- **NEW**: ipset whitelist (network/setup-firewall)
- **NEW**: append config.ini support (apnscp/bootstrap)
- **NEW**: [migration] => status_email, [letsencrypt] => notify_failure, [crm] => copy_admin, tuneable address to report status for migration/SSL renewal/system messages (config.ini)
- **NEW**: alternative module/method delineator ":" (cmd)
- **NEW**: soft delete packages on downgrades. Remove package from FST without removing from database. yum-post.php remove --soft (Yum::Synchronizer)
- **NEW**: install hook (Yum::Synchronizer)
- **NEW**: list_mailboxes()- filter type "destination". Filter by addresses that match a specific destination (email)
- **NEW**: filter_by_command()- select cronjobs whose command match a string (crontab)
- **NEW**: apnscp.low-memory, put panel in low memory mode, 2GB + Discourse installs (Opcenter\Admin)
- FIX: POST sends discontinuously indexed array (ajax)
- FIX: subclassed signature (Mail\Providers\Null)
- FIX: calling unlock() after factory($context) creates an invalid reference if the context ID is the active session ID (Preferences)
- FIX: restricted theme, plugin updates. Honor version lock. (wordpress)
- FIX: cast version to string. Artifact from fixed CLI float parsing (Validators\Common)
- FIX: explicitly name statfile categories to avoid JSON elision (mail/rspamd)
- FIX: floats parsed as string (Opcenter\CliParser)
- FIX: typo (Lararia\Console\Commands)
- FIX: switch to variable non-blocking select(). Resolves lockups in high frequency scenarios with async signal handling (apnscpd)
- FIX: bug #30599 workaround (mail/configure-postfix)
- FIX: immediately cleanup worker pid on SIGCHLD. Multiple processes can exit when a non-realtime signal is blocked yielding only a single SIGCHLD. This results in ignoring the first PID creating phantom workers (apnscpd)
- FIX: lost commit, type check (Opcenter\Admin\Bootstrapper)
- FIX: TimeoutStartUSec -> TimeoutStartSec (mysql/install)
- FIX: empty TAGS treated as literal parameter (upcp)
- FIX: global event (*.) filter (Cardinal)
- FIX: resolve "No PostgreSQL link opened yet" that can occur in rolling back a failed edit (Opcenter\Database)
- FIX: correct da661fda, rename -> rename-command (redis.conf)
- FIX: array_replace_recursive performs value substitutions instead of intended key replacements (Opcenter\Service)
- FIX: populate alias map on creation (Opcenter\Service\Validators)
- FIX: numeric type always coerced into string (Bootstrapper\Config)
- FIX: remove duplicate content-type header in HTML mode (Providers\Mailbot)
- FIX: Visit Site link (Web Apps)
- FIX: including apnscp/build-php outside of bootstrap playbook fails to locate dependencies (apnscp/build-php)
- FIX: mailbot reserved variable conflict, FLAGS (Vacation\Providers)
- FIX: set_vacation_options()- vacation key treated as literal (email)
- FIX: enabling vacation creates .mailfilter with incorrect ownership (Providers\Mailbot)
- FIX: clipboard selection, clipboard operations (File Manager)
- FIX: operator precedence (lservice)
- FIX: lifetime license typing fixup (Opcenter\License)
- FIX: pman_run third argument type (Traceroute)
- FIX: space ignored in scalar argument (Opcenter\CliParser)
- FIX: strict typing (SSL Certificates)
- FIX: _edit_user()- scalar dereferenced as array (aliases)
- FIX: unhandled TypeError exception as non-error (DeleteDomain)
- FIX: missing parameter (Validators\Mysql)
- FIX: string/array parser mismatch (Opcenter\CliParser)
- FIX: missing section (system/logs)
- FIX: job runner ghosting if backend restarts before timeout reached (apnscpd)
- FIX: update()- invalid wrapper invocation fails to query Discourse version (discourse)
- FIX: operator precedence (mail/rspamd)
- FIX: disabling rspamd_use_spamassassin_rules iterates over empty dict (mail/rspamd)
- FIX: alias expansion (mail/configure-postfix)
- FIX: virtual_mailbox_limit less than $message_size_limit (mail/configure-postfix)
- FIX: pass HOME when running Bootstrapper as background job (mysql/install)
- FIX: /etc/sudoers inherited from system default (apnscp/initialize-filesystem-template)
- FIX: add MariaDB startup timeout for large InnoDB pools which could result in a cyclic restart on large servers (mysql/install)
- FIX: revert permissions on php.config (build)
- FIX: update()- typo (discourse)
- FIX: platform compatibility, pre v6.5 use SysV apnscp startup (Opcenter\Apnscp)
- FIX: XML element access halts after initial element (Net\Firewall)
- FIX: lockdown()- setfacl yelps if [d]efault ACL applied to file (watch)
- FIX: ripple effect (Nexus)
- FIX: architecture decay, add back hook support (letsencrypt)
- FIX: ripple effect collapses btn-group (Manage Users)
- FIX: drop database schema ownership during transfer (Transfer)
- FIX: /etc/vsftpd initial user configuration fails on v7.5+ platforms due to write restrictions (ftp)
- FIX: version_from_path()- trim trailing newline (ruby)
- FIX: update()- typo parameter name (discourse)
- FIX: build domainmap.tch on first run (auth)
- FIX: unserialize restrictions (Template Engine)
- FIX: yum semantics change (packages/install)
- FIX: downgrading package double-removes files (Yum::Synchronizer)
- FIX: creating a symlink within a filesystem layer whose referent points to a referent that does not exist fails (Yum::Synchronizer)
- FIX: orphaned directories left behind upon package remove (Yum::Synchronizer)
- FIX: account meta deserialized as incomplete class (Auth_Info_Account)
- FIX: race condition between queued job ID/atd (Util_Process::Schedule)
- FIX: parameter misordering results in incorrect HTTP response code (login)
- FIX: subdomain sorting order (Web Apps)
- FIX: "migrate" command options appears erroneously in fluent description (artisan)
- FIX: validate account metadata workaround for phpredis connection inconsistency (Auth_Info::Account)
- FIX: ulimit size reported in blocks (apnscp/bootstrap)
- FIX: worker reference counting (apnscpd)
- FIX: locale radix character used instead of literal "." in app gauge (Page Template)
- FIX: global preferences erroneously merge into user preferences (common)
- FIX: save_preferences()- preferences edited during page lifecycle overwritten by initial preferences (common)
- FIX: "Maxed workers" error triggered within worker IPC instead of apnscpd socket (apnscpd)
- FIX: check()- obey /etc/nologin presence (Util_Pam)
- FIX: UTF-8 support on file operations (apnscpd)
- FIX: SIGKILL only available in CLI (pman)
- FIX: normalize_path()- return type from get_docroot (web)
- FIX: stat cache is not cleaned for subsequent items during internal cache clean (file)
- FIX: purge cache on chown and chmod operations (file)
- FIX: get_docroot()- resolving an irresolvable subdomain abandons the initial query domain (web)
- FIX: protect unauthorized zone leakage (dns)
- FIX: system registration extension (letsencrypt)
- FIX: move pam_nologin before system-auth stack (system/pam)
- FIX: dereference certificate a x509 resource instead of literal string on server issuance (letsencrypt)
- FIX: flip needsIssue() sign (Opcenter\License)
- FIX: account canonical name (letsencrypt)
- FIX: update()- wrapper reference (discourse)
- FIX: argos_config argument marshalling (Admin\Settings)
- FIX: systemlog driver infinite recursion (Admin\Settings)
- FIX: argos_config argument marshalling (Admin\Settings)
- FIX: getHost()- strip proto from hostname (Util_HTTP)
- FIX: potential race condition with async signal handling. When a backend worker fails, cleanup can occur before spawning a new worker or the worker can be selected after cleanup leading to a deadlock on that DataStream connection (apnscpd)
- FIX: potential race condition with async signal handling. When a backend worker fails, cleanup can occur before spawning a new worker or the worker can be selected after cleanup leading to a deadlock on that DataStream connection (apnscpd)
- FIX: default to /bin/bash if SSH not enabled for user (Add User)
- FIX: use system locale. Reset to system locale on worker transition (apnscpd)
- FIX: ignore kill() status (Lararia\JobDaemon)
- FIX: STATUS_EMAIL typo (CLI::Transfer)
- FIX: check if module initialized with authentication scope to squelch ssh_enabled() no such command warning (redis)
- FIX: missing constructor call (redis)
- FIX: update()- fetch tags (discourse)
- FIX: diff()->days returns absolute value (Opcenter\License)
- FIX: Safari, mobile fixes
- FIX: status return value (Opcenter\Account)
- FIX: \Lararia\JobDaemon::start() return type (apnscpd)
- FIX: invalid process concurrency condition (Webapps\Passenger)
- FIX: generate()- charset insufficiently expanded (Opcenter\Auth)
- FIX: proxy redirect loop (Util::HTTP)
- FIX: unfiltered ini sections collapsed into top-level (Opcenter\Map)
- FIX: stat()- can_chgrp is bool (file)
- FIX: copy()- OSA allows sidestepping permission checks if file resides on shadow layer thus permitting copying /etc/shadow, /root/.bash_history, and other potentially sensitive files that may on a virutal filesystem. Add a secondary DAC check to skip if file lacks g/o rwx permissions (file)
- FIX: configured predefined PASV ports for FTPS which cannot be sniffed by nf_conntrack_ftp (vsftpd/configure)
- FIX: clearstatcache() parameter ordering (ghost)
- FIX: attempt certificate issuance when [letsencrypt] => additional_certs or hostname not contained within system certificate (letsencrypt)
- FIX: set process concurrency to 0 for Discourse webapps. Resolves mutex locks that occur from Passenger's concurrency inference heuristics (discourse)
- FIX: potential loop iterator collision (php/install-pecl-module)
- FIX: logrotate spec (system/misc-logrotate)
- FIX: inspect cur/, new/ instead of parent for old spam (software/tmpfiles)
- FIX: ipset driver fails to match blanketed block (Opcenter\Net\Firewall)
- FIX: Ansible 2.7 syntax changes
- FIX: impossible to remove a value through omission (common/write-config)
- FIX: getApnscpFunctionInterceptorFromDocroot()- incorrect namespace reference (Webapps)
- FIX: rename tablespace owner on dbaseadmin change (PostgreSQL)
- FIX: secondary email addresses not created when requested (Add User)
- FIX: delete uid after discarding user (email)
- FIX: uninstall()- clean document root when relocated (Webapps)
- FIX: alternatives not present system-wide forces immediate return (Yum::Synchronizer)
- FIX: set_owner()- fails when database contains non alphanumeric characters (pgsql)
- FIX: apnscp-helpers.sh treated as plain-text (apnscp/admin-helper)
- FIX: cleanup fork session disassociation semantics. Fixes stream_select interruption (Process)
- FIX: getServiceValue()- service not fully initialized on site creation. Add additional lookup to verify service is in cur/ otherwise pull new/ (Module_Skeleton)
- FIX: burrowing relocatable docroot (Webapps)
- FIX: fork/session/signal handling compliance (apnscpd)
- FIX: workaround for cannot redeclare class Template_Engine error (dispatcher)
- FIX: clear inherited signal handlers from parent (Util_Process::Fork)
- FIX: children of process fail to run due to incorrect signal handling (Util_Process::Fork)
- FIX: catch exceptions (Lararia\Job)
- FIX: burrowing docroot (discourse, laravel)
- FIX: enforce wtmp_limit_snooping on logrotate (system/misc-logrotate)
- CHG: cleanup URI on new page URL (HTML_Kit)
- CHG: add meta redirect (Login)
- CHG: Chrome .btn-group border (CSS)
- CHG: AJAX unbuffered parameter arguments (Traceroute)
- CHG: update Browscap (Util_Browscap)
- CHG: run() restrict tee permissions (pman)
- CHG: move Browscap to housekeeping (misc)
- CHG: disable mysqli persistent connections (php/create-configuration)
- CHG: switch back to nonblocking after writing to IPC (apnscpd)
- CHG: bump ionCube compiler to 10.2 (apnscpd)
- CHG: meta handling rewrite; use MetaManager directly. (Module\Support\Webapps)
- CHG: register ephemeral account cleanup as a shutdown function. Circular references can force an apnscpFunctionInterceptor reference to linger that may store preferences after the account is removed once the reference is freed (Opcenter\Account)
- CHG: html cleanup
- CHG: cleanup webapp meta renaming rules. Leave reference to webapp when docroot changes. Update hostname when domain changes (aliases, web)
- CHG: load_preferences()- always prefer cache lookup (common)
- CHG: user_enabled() visibility (email)
- CHG: set worker in non-blocking until request received, then block until processed. Resolves async signals that block socket_select() indefinitely (apnscpd)
- CHG: disable autolearn in piggyback mode (mail/rspamd)
- CHG: explicit sync() (Settings\Apnscp\Bootstrapper)
- CHG: update checkbox style (Change Information)
- CHG: close all inherited descriptors on fork. Set listener socket in non-blocking mode (apnscpd)
- CHG: define bayes classifier category, set statfile symbols. Bump autolearn upper threshold to 10 (mail/rspamd)
- CHG: revert back #2c790e6a (apnscpd)
- CHG: remove workplace directory on fresh ionCube install (apnscp/install-extensions)
- CHG: PHP 7.3 compatibility, add libzip dependency (apnscp/initialize-filesystem-template)
- CHG: cleanup worker on corruption (apnscpd)
- CHG: scope id change to apnscpFunctionInterceptor::set_session_context() (apnscpd)
- CHG: define mock administrator for alarm (mail/webmail-horde)
- CHG: permit proxy access to backup postscreen/verify maps (mail/configure-postfix)
- CHG: remove()- non-existent package marker (Yum::Synchronizer)
- CHG: bump rules directory to 3.004002 (mail/spamassassin)
- CHG: horde_force_config_update, force regeneration of Horde configuration. Fix SMTP/Ingo auth (mail/webmail-horde)
- CHG: move libevent from ssh to siteinfo (apnscp/initialize-filesystem-template)
- CHG: add clamav group ACL. Default permissions on /var/lib/clamav 770. ClamAV development is mercurial, use ACLs to always guarantee r/o access by clamd to database (clamav/setup)
- CHG: removing credit card bypasses billing info update (Change Billing)
- CHG: add global event "COMPLETED". An event triggered at completion of account maintenance if no fatal errors encountered. (Cardinal)
- CHG: update rspamd configuration (greylist, fuzzy). Install FST dependencies (mail/rspamd)
- CHG: context()- enforce sanity check that $domain maps to domain after mapping to site id (Auth)
- CHG: legacy merge for platforms before v7.5 (Util_Account::Hooks)
- CHG: skip orphaned certificates (letsencrypt)
- CHG: disambiguate commit() to writePendingConfiguration() (Opcenter\SiteConfiguration)
- CHG: move commiting pending configuration to shutdown function. Allow hooks to process new/old configuration (Opcenter\ConfigurationContext)
- CHG: cache plugin enumeration (Yum::Synchronizer)
- CHG: restore default behavior of new, cur, old - new shall only contain journaled or incomplete service edits (Auth\Info\Account)
- CHG: synchronize_changes()- migrate metadata reset to API call (aliases)
- CHG: implement handling sync queue driver (Lararia\RawManipulation)
- CHG: extract file download into helper function (HTML_Kit)
- CHG: disconnect Redis socket on fork (apnscpd)
- CHG: set z-index on ui-app-container (css)
- CHG: check session validity to confirm credential change processed. Provides proper response for situations in which metadata changes but post-processing hooks fail, which are never fatal (Change Information)
- CHG: restrict file browser to domain location base path (Addon Domains)
- CHG: ignore ghosted/orphaned domains when enumerating list, which cannot be contexted (Nexus)
- CHG: always validate mail and dns provider services. "null" module needs to be doubly-escaped to parse as literal. Unless done provider defaults to builtin. Adding AlwaysValidate to service property ensures null -> "null" fixup can occur. Default service value is "builtin" (Service\Validators)
- CHG: relax services in non-strict mode (Opcenter\CliParser)
- CHG: create email named after primary user on v7.5+ platforms (email)
- CHG: up greylisting expiry, reject/header scores (mail/rspamd)
- CHG: allow non-backend access to clamdscan by apnscp (roles/clamav)
- CHG: enable hardlink/symlink hardening (system/sysctl)
- CHG: prefix value "None" disables implicit override prefix (common/tasks)
- CHG: update checkbox (Login)
- CHG: bypass meta when account count greater than 24 (Nexus)
- CHG: move rbenv-usergems to apisnetworks (software/rbenv)
- CHG: record rspamd/clamav states in apnscp
- CHG: immutable session data per backend process (apnscpd)
- CHG: always reload directory contents. Workaround case where parent directory contents are never loaded (filetree.js)
- CHG: cleanup (Vacation Responder)
- CHG: get_directory_contents()- error message formatting (file)
- CHG: revert automatic formatting (Manage Mailboxes)
- CHG: cast metadata into array (Auth_Info)
- CHG: clamav/rspamd markers (config.ini)
- CHG: update()- assert version match (laravel)
- CHG: revert formatting anomaly (MySQL Manager)
- CHG: isTrial()- flip intention check (License)
- CHG: hash_encode cb, accept JSON data type (DNS Manager)
- CHG: increase isAjax() visibility to subclass (Page Container)
- CHG: force MySQL reinitialization on fork - potentially resolve premature end of data/packets out of order errors (mysql)
- CHG: open up world permissions on docroots within home directories (aliases)
- CHG: mass reformat
- CHG: experimental link hardening (system/sysctl)
- CHG: convert spam/ham thresholds into tuneables (mail/rspamd)
- CHG: tune ham/spam piggyback threshold (mail/rspamd)
- CHG: mongodb now optional. Enable with mongodb_enabled=true
- CHG: cast passenger_enabled (system/misc-logrotate)
- CHG: sort RR types. Add additional type hints (Dns Manager)
- CHG: coerce no/yes into boolean (Admin\Bootstrapper)
- CHG: validate metadata state on depopulation (Validators\Mysql)
- CHG: cast yes/no into bool in when condition
- CHG: neural condition (mail/rspamd)
- CHG: disable SA rules by default. Cleanup reputation backends. Convert "self_scan" type. Enable spam headers in piggyback mode (mail/rspamd)
- CHG: separate ham/spam learn folders (mail/configure-dovecot)
- CHG: guard against session corruption (Module_Skeleton)
- CHG: array_get(), array_has()- support objects that implement ArrayAccess (helpers)
- CHG: set default logging level (mail/rspamd)
- CHG: support Redis password (mail/rspamd)
- CHG: error message on malformed partial JSON (mail/rspamd)
- CHG: block exception termination (Lararia\Jobs)
- CHG: return type on error (Net\Fail2ban)
- CHG: set journald upper limit to 3 GB. Workaround for fail2ban segfault on >= 4 GB journals (system/logs)
- CHG: use rspamd default /var/lib/rspamd for runtime (mail/rspamd)
- CHG: get_site_id_from_invoice()- legacy workaround for pre-7.5 platforms (Auth)
- CHG: move mail configuration after FST initialization (bootstrap.yml)
- CHG: run only db migration on first run (apnscp/create-admin)
- CHG: prefix IMAP root. Move Junk to "Spam". Enable auto-subscription on Spam, Drafts folders (mail/configure-postfix)
- CHG: relocate Postfix to shared root (mail/configure-dovecot)
- CHG: backup rspamd Redis database periodically (mail/rspamd)
- CHG: spamc -L (ham|spam) determined by spamassassin_enable_spamd_tell (mail/spamassassin)
- CHG: increase greylist threshold to 10 in untrained environment (mail/rspamd)
- CHG: preserve maildrop templates (mail/maildir)
- CHG: Configuration tweaks- constrain Redis memory. Normal worker on UNIX socket. Enable reputation module. Reclassify autolearn within [-2.5, 7.5] threshold. Disable normal worker in low memory environments (rspamd)
- CHG: always use X-Spam-Score header (mail/rspamd)
- CHG: swap localmaildrop service with mailbox_transport (mail/configure-postfix)
- CHG: cleanup (mail/rspamd)
- CHG: smtpd_relay_restrictions separate subset of smtps_recipient_restrictions as of 2.10 (mail/configure-postfix)
- CHG: move to GitLab
- CHG: get_meta_from_domain()- code cleanup (admin)
- CHG: automatically renew 30/20 days out to preempt Let's Encrypt reminder email (letsencrypt)
- CHG: timeout to check master status periodically (apnscpd)
- CHG: bypass ssh_enabled() check for ineligible roles (redis)
- CHG: use verbosity to control stderr warning (Util_Process)
- CHG: expand filtered functions from caller (Error Reporter)
- CHG: prep upcp for tagged releases (upcp.sh)
- CHG: add PHP FPM build support (php.config)
- CHG: add bandwidth graph (Bandwidth Breakdown)
- CHG: disambiguate module hook (Util_Account::Hooks)
- CHG: preserve session data when auth,pwoverride=1 (Service\Validators)
- CHG: email creation on primary domain no longer compulsory (email)
- CHG: update()- check Ruby interpreter meets minimum requirements before processing Discourse update (discourse)
- CHG: trim username (Login)
- CHG: add additional sanity check when fetching account meta (Auth_Info::Account)
- CHG: dd formatting in ISAPI (helpers)
- CHG: asterisk global subdomains (webapps)
- CHG: allow importing of E_FATAL into buffer without immediately terminating code (Error_Reporter)
- CHG: output editor as JSON on v7.5+ platforms (Util_Account::Editor)
- CHG: use Ruby 2.5.3+ for Discourse (discourse)
- CHG: update account editor routines to use JSON, disable edit/add/delete for pre v7.5 platforms (admin)
- CHG: list()- sort (config)
- CHG: permit test module access to all levels in debug (test)
- CHG: use UTF-8 with all locales (Settings)
- CHG: inContext() semantics change, $authContext passed with all most module instantiations now so validate the session ID matches the context ID (ContextableTrait)
- CHG: link preferences instance with Session helper (Preferences)
- CHG: install()- reduce bloat by restricting WP post revisions to 5 (wordpress)
- CHG: extract worker ID as bitwise operation (apnscpd)
- CHG: get_partition_information()- filter duplicate mount points (stats)
- CHG: disable prepared statement emulation (mysql)
- CHG: use alarms for worker collection (apnscpd)
- CHG: rewrite app (SSL Certificates)
- CHG: hide amnesty for quotaless sites (Summary)
- CHG: accept LANG in lieu of LC_ALL environment variable (apnscpd)
- CHG: --reset pull refs from master (upcp)
- CHG: update various libraries
- CHG: add warning if proclimit less than 100 (Validators\Cgroup)
- CHG: append_msg()- duplicate errors returns true instead of false (Error Reporter)
- CHG: workers restore SIGCHLD to system default (apnscpd)
- CHG: remove()- ignore mail spool warnings (Role\User)
- CHG: save original SIGALRM handler when timeout set (Util_Process)
- CHG: cleanup socket_select, refactor stream to socket (apnscpd)
- CHG: spawn immediately after SIGCHLD (apnscpd)
- CHG: send TERM instead of KILL to worker (apnscpd)
- CHG: restore all applicable signal handlers to system default after fork (Util_Process::Fork)
- CHG: reserve worker earlier on spawn (apnscpd)
- CHG: unreachable hostnames in system certificate trigger warning instead of reissuance (letsencrypt)
- CHG: install()- use default Ruby version once declared. Check cgroup,proclimit is sufficient for installation (100+ threads) (discourse)
- CHG: update()- strict handling of drush exit status (drupal)
- CHG: ignore Node validation on Ghost update. Validating version can trigger Node upgrade resulting in an unwanted Node version (ghost)
- CHG: make_default()- resolve LTS to its literal version (node)
- CHG: generate_csr()- support subject alternative names (ssl)
- CHG: clear stat cache on current/ symlink on version query (ghost)
- CHG: reissue apnscp certificate as necessary in housekeeping (auth)
- CHG: cast ssl_hostnames to list (apnscp/register-ssl)
- CHG: method visibility (Opcenter\License)
- CHG: update timezone in /etc/php.ini and config/php.ini on system timezone change (Admin\Settings)
- CHG: release inherited apnscp.sock resource on fork (apnscpd)
- CHG: move config retrieval to get_config (argos)
- CHG: config()- explicitly passing null to $newparams resets backend
- CHG: update()- run restart from auth context (discourse)
- CHG: convert Argos to ntfy backend. Credit: David Kozinn (software/argos)
- CHG: format status in Yaml (ansible.cfg)
- CHG: use ntfy for Argos alerts, support multiple backends (Pushover, Pushbullet, XMPP, Slack, etc). Credit: David Kozinn (argos)
- CHG: string coercion compiles view on-the-fly (Opcenter\ConfigurationWriter)
- CHG: update prism.js
- CHG: add sample code, WSDL path (API Keys)
- CHG: convert Argos to ntfy backend. Credit: David Kozinn (software/argos)
- CHG: format status in Yaml (ansible.cfg)
- CHG: inherit stream_select interrupted system call suppression by all workers (apnscpd)
- CHG: set_email()- update apnscp_admin_email if present (admin)
- CHG: rollback cleanup (apnscpd)
- CHG: coalesce()- return empty string instead of null (helpers)
- CHG: formally cleanup terminated worker (apnscpd)
- CHG: use migrations (apnscp/cron)
- CHG: fetch()- support additional arguments (git)
- CHG: expose more License methods (Opcenter)
- CHG: set min/max pool size (discourse)
- CHG: support min-instances, max-pool-size variables (Webapps\Passenger)
- CHG: set()- disambiguate bool as true/false in apnscp.config (Opcenter\Admin)
- CHG: flush cgroup controller configuration (Opcenter\Provisioning)
- CHG: Passenger unit testing (tests)
- CHG: create test account on demand, cleanup tests (tests)
- CHG: deprecate shared_domain_exists for domain_exits (aliases)
- CHG: set Ruby GC variables (discourse)
- CHG: copy()- strictly check read permission instead of permitting copy if file has group/other r/w/x (file)
- CHG: generate_csr()- update digest algorithm to sha256 (ssl)
- CHG: move blacklist to rich rules (network/setup-firewall)
- CHG: silence()- supress application-generated errors (Error_Reporter)
- CHG: set_verbose()- return previous verbosity (Error_Reporter)
- CHG: code cleanup (Util::HTTP)
- CHG: get()- accept variadic arguments (config)
- CHG: /tmp defaults to 3777 (Opcenter\Siteinfo)
- CHG: convert [cgroup] => controllers into array (Opcenter\System)
- CHG: restart vsftpd synchronously (ftp)
- CHG: copy()- create directory counts as file copied (file)
- CHG: get()- accept variadic arguments (config)
- CHG: restart vsftpd synchronously (ftp)
- CHG: deprecation warnings (apnscp/build-php)
- CHG: simplify config check (apnscp/bootstrap)
- CHG: remove Passenger when disabled (software/passenger)
- CHG: consistency, rename clamav_enable -> clamav_enabled (apnscp-vars)
- CHG: bump nproc limit to 256 (system/limits)
- CHG: cleanup TCP Port Range (Summary)
- CHG: convert [anvil] => whitelist, [dns] => allocation_cidr, authoritativ_ns, hosting_ns, [letsencrypt] => additional_certs constants into implicit arrays (config)
- CHG: send Accept: application/json header (Auth::Redirect)
- CHG: convert static cache to instance. Removing a site, then readding with different meta causes corruption. Individually tracking resets among modules untenable (file, user)
- CHG: verify file exists before calculating size (logs)
- CHG: update()- update gems with bundle install, not update (discourse)
- CHG: ansible_fqdn performs f/r DNS resulting in erroneous hostname when hostname configured as 127.0.0.1 in /etc/hosts (playbooks)
- CHG: listen on 127.0.0.1 (apache/configure)
- CHG: set cookie secret (apnscp/bootstrap)
- CHG: flow trigger_fatal() through append_msg to allow exception upgrade (Error Reporter)
- CHG: accept irregular versions if at least 3 version components present (Opcenter\Versioning)
- CHG: version bump (config.ini)
- CHG: set $child=true for housekeeper (apnscpd)
- CHG: rename action to banaction for recidive (fail2ban/configure-jails)
- CHG: accept patch version levels that begin with at least 1 number (Versioning)
- CHG: update()- use assigned Ruby version (discourse)
- CHG: expand API to user admin (ruby)
- CHG: remove postgres group on pgsql depopulation
- CHG: valid()- convert current/ from absolute to relative symlink on demand (ghost)
- CHG: verify Redis exists before attempting removal (discourse)
- CHG: tolerate pre-existing email addresses if address matches proposed addition (Add User)
- CHG: SIGCHLD can stack multiple children into a single signal. Enumerate all children (apnscpd)
- CHG: create Passengerfile.json for easy startup/stopping
- CHG: revoke access and terminate connections before dropping database (PostgreSQL)
- CHG: revert specific check for "Interrupted system call". track_errors is deprecated leaving the options to either set set/restore error handlers or wrapping processing in a try/catch neither of which are optimal (Util_Process)
- CHG: signal handling (Util_Process)
- CHG: create_user()- create maildir if absent (email)
- CHG: improve installation process (discourse)
- CHG: handle interrupt from signal (Util_Process)
- CHG: set PATH (apnscpd)
- CHG: list_users()- bail if prefix missing (mysql, pgsql)
- CHG: worker kill logic (apnscpd)
- CHG: send 429 response + text reason for Anvil rejection (Auth::Anvil)
- CHG: always use document root when app is not installed (Webapps)
- CHG: relocate pcntl_async_signals() to apnscpcore
- CHG: cap Laravel on PHP version (laravel)
- CHG: enable nightly updates by default (apnscp-vars.yml)
- REM: storage gauge when quota unlimited (Page Template)
- REM: dead code (php/install-pecl-module)
- REM: non-blocking mode for ipc (apnscpd)
- REM: localize worker spawn to findWorker() (apnscpd)
- REM: persistent connections (Cache)
- REM: common/update-config tasks
- REM: FST installation cache job - generated on demand (apnscp/crons)
- REM: $cur property reinitialization (Opcenter\SiteConfiguration)
- REM: --extra-vars save. Use "cpcmd config_set apnscp.bootstrapper var val" to permanently alter Bootstrapper parameters (common/update-config)
- REM: create_symlink()- deprecated (file)
- REM: map rebuild on v7.5+ platforms (auth)
- REM: no-op private usage (php/build-from-source)
- REM: auto-populate admin (discourse)
- REM: normalize_path() cache (web)
