---
title: Tuneables
---

```ini
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;   ApisCP master configuration   ;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;
; ************ WARNING ************
; DO NOT EDIT DIRECTLY.
; SET NEW VALUES IN conf/custom/config.ini
; OR USE CLI HELPER:
; cpcmd scope:set cp.config <section> <name> <value>
; ************ WARNING ************
;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

;;;
;;; Core configuration that affects all aspects of ApisCP
;;;
[core]
; Use env DEBUG=1 environment variable to trigger debug
debug = ${DEBUG}
; Display backtraces on (1) error, (2) warning, (3) info, (4) debug/deprecated
; all higher numbers imply lower class reporting; 4 produces backtrace on all
; backtrace occurs when debug set to true.
; Set to -1 to disable backtrace on ApisCP-generated events,
; but continue to display PHP error/warning/notice backtraces
debug_backtrace_qualifier=1
; Global temp directory, reflected within virtual domains
temp_dir = /tmp

; In multiserver setups behind a proxy (cp-proxy),
; trust the following source IP or network for X-Forwarded-For
; See https://github.com/apisnetworks/cp-proxy
; One or more addresses may be listed each separated by a comma
http_trusted_forward =
; Root directory that stores all
filesystem_virtbase = /home/virtual
; Filesystem template location
filesystem_template = /home/virtual/FILESYSTEMTEMPLATE

; A path that is shared across all sites as read/write
filesystem_shared = /.socket

; Location for run files
run_dir = storage/run

;locale = 'en_US.UTF-8'
; system default, overrides php.ini
;timezone = 'America/New_York'
; Send a copy of all unhandled errors generated in ApisCP
;bug_report =

; Brand name for the panel, for white-label
panel_brand="ApisCP"
; ApisCP version
apnscp_version="3.1"
; ApisCP system user
apnscp_system_user=nobody
; preload backend modules
; increases backend initialization but checks for errors
fast_init=!${DEVELOPMENT}
; frontend PHP dispatcher, embed or fpm (dev only!)
dispatch_handler=embed

[style]
; Default apnscp theme
theme = "apnscp"
; Allow custom themes
; See https://github.com/apisnetworks/apnscp-bootstrap-sdk
allow_custom = false
; Override ApisCP JS
override_js = false
; Forbid the following themes
; Setting * forbades all themes but assigned theme. Must come first.
; Themes can be negated with a ! prefix. To blacklist all themes
; but [style] => theme + "dorodoro", set
; blacklist="*,!dorodoro"
blacklist=
; Enable Gravatar display. Leave empty to disable
; Possible values: 404, mp, identicon, monsterid, wavatar, retro, robohash, blank
gravatar=identicon

;;;
;;; SOAP API
;;;
[soap]
; Enable soap? Disabling also disables server-to-server migrations
enabled = 1
; WSDL name, located under htdocs/html/
wsdl = "apnscp.wsdl"

;;;
;;; Backend
;;;
[apnscpd]
; Location for apnscpd backend socket
; specify an absolute path to store outside of ApisCP
socket = storage/run/apnscp.sock
; Maximum number of backend workers permitted
max_workers = 5
; Minimum number of idle backend workers
min_workers = 1
; Workers to spawn initially
start_workers = 0
; Max backlog per worker
max_backlog = 20
; Interval in seconds to prune idle workers
collection_interval = 30
; Make panel a headless installation, no front-end loaded
; Driven entirely by CLI
headless = false

;;;
;;; ApisCP brute-force deterrent
;;;
[anvil]
; max auth attempts before all auth is rejected
limit = 20
; duration to retain anvil statistics
ttl = 900
; minimum number of permitted logins before anvil kicks in
min_attempts = 3
; Whitelist for Anvil attempts
; Accepts networks and single IP addresses, separate with a comma
whitelist = 127.0.0.1

;;;
;;; DAV
;;;
[dav]
; Enable DAV
enabled = 1
; Allow non-DAV browser requests + interface
browser = 1
; Allow DAV in Apache. All resources must be secured separately
apache = 0

;;;
;;; Ticket system + system generated emails
;;;
[crm]
; send a small, MMS-suitable, message when a high
; priority ticket is opened or reopened to here
short_copy_admin =
; System email to dispatch internal issues such as
; certificate renewal failures or tickets
copy_admin = apnscp@${HOSTNAME}
; Address used to send emails
from_address = apnscp@${HOSTNAME}
; From name for above address
from_name = ApisCP
; No-reply used for password reset and login alerts
from_no_reply_address = apnscp@${HOSTNAME}
; Generalied reply-to address for ticket system
reply_address = apnscp+tickets@${HOSTNAME}

[session]
; Maximum duration an idle session is valid
ttl = 15 minutes

;;;
;;; Backend cache
;;;
[cache]
; In multi-server installations, use the following
; Redis server as an aggregate cache otherwise
; local Redis is used.
; Ensure configuration includes periodic RDB dump or AOF rewrite
super_global_host =
super_global_port =

; SG password. Super global, if defined, is reachable
; over network and thus open to abuse. See also
; https://packetstormsecurity.com/files/134200/Redis-Remote-Command-Execution.html
super_global_password =

; Local ApisCP cache. Socket only; never use TCP
; as it contains sensitive data
socket_perms = 0600

;;;
;;; Let's Encrypt SSL
;;;
[letsencrypt]
; When signing a certificate use LE staging server
debug=true
; X1 X509 authority key identifier - shouldn't change
keyid=A8:4A:6A:63:04:7D:DD:BA:E6:D1:39:B7:A6:45:65:EF:F3:A8:EC:A1
; X1 X509 staging authority key identifier - shouldn't change
staging_keyid=C0:CC:03:46:B9:58:20:CC:5C:72:70:F3:E1:2E:CB:20:A6:F5:68:3A
; Perform a DNS check on each hostname to ensure it is reachable
; If any hostname fails the ACME challenge, e.g. DNS points elsewhere, renewal
; will fail. Keep this on unless you know what you're doing
verify_ip=true
; Include alternative form of requested certificate
; e.g. foo.com includes www.foo.com and www.foo.com includes foo.com
; This requires that verify_ip=true
alternative_form=false
; Additional hostnames to request SSL for
additional_certs=
; Day range a certificate may renew automatically. lookahead is max days to renew
; before expiry; lookbehind is min days to renew.
;
; A lower bracker (lookbehind) is necessary to ensure defunct domains
; are not continuously renewed - or attempted for renewal - against LE's servers.
; Set lookbehind to a large negative int (-999) to attempt to renew all defunct
; certificates.
; Set lookahead to a large positive int (999) to force reissue for all certificates.
; Default settings attempt renewal 10 times, once daily.
lookahead_days=10
lookbehind_days=0
; Send a notification email to [crm] => copy_admin on certificate renewal failure
notify_failure=1
; Use a single account manged by server admin (cpcmd common:get-email)
unify_registration=1
; Attempt to request SSL certificates for all domains on an account up to n times
; Each attempt is delayed 12 hours to accommodate network changes.
bootstrap_attempts=3
; Disable certain challenge modes. Use a comma-delimited list for each
; Challenges will still appear in letsencrypt:challenges but skipped during acquisition
disabled_challenges=tls-alpn

;;;
;;; DNS + IP assignent
;;;
[dns]
; When adding IP-based sites, range from which IP addresses
; may be allocated. Supports comma-delimited and CIDR notation
allocation_cidr=
; Hosting nameservers sites should use when hosted through the panel
; Leave empty to disable a NS checks
hosting_ns=
; Vanity nameservers that when any of which are present satisfy the nameserver
; check for the domain. Unlike hosting_ns, which ALL must match any MAY match.
; When empty, "hosting_ns" will be used. When "hosting_ns" is empty this is ignored.
vanity_ns=
; Nameserver that responds authoritatively for any account hosted
; *NOTE*: this should point to the nameservers you use for your domain
authoritative_ns=127.0.0.1
; Recursive nameservers used to verify visibility of DNS records
recursive_ns=127.0.0.1
; A single internal master responsible for handling rndc/nsupdate and internal DNS queries
internal_master=
; Primary IP address of the server used in multi-homed environments, leave blank to autodiscover
my_ip4=
; Primary IPv6 address of the server used in multi-homed environments, leave blank to autodiscover
my_ip6=
; Default remote IPv4 address for DNS. See docs/NAT.md
proxy_ip4=
; Default remote IPv6 address for DNS. See docs/NAT.md
proxy_ip6=
; Use provider if dns,provider is not set for domain.
; Specifying "DEFAULT" as DNS provider will use this inherited configuration.
provider_default="null"
; Optional global provider key, same form as dns,provider
; If set in bootstrap.sh, use cpcmd config_set dns.default-provider-key
provider_key=
; UUID to assign this server. UUIDs are used to collaborate with different servers
; to determine whether to remove a DNS zone, e.g. moving server -> server with different
; UUIDs will persist the records when the domain is deleted from Server A so long as the DNS UUID
; differs
uuid=
; Default TTL value for newly created DNS records
default_ttl=43200
; For NAT'd systems, when connecting to the public IPv4/IPv6
; determine if router is capable of looping back public => private IP
; -1 performs an autodetection, 0 router lacks capability, 1 router supports
hairpin=-1

[mail]
; SMTP/IMAP/POP3 uses proxied content handler
; Options are "haproxy" or "null"
proxy =
; Spam filter in use, "spamassassin" or "rspamd"
spam_filter=spamassassin
; Default provider to use for mail
; "builtin" relies on Postfix "null" for testing
provider_default=builtin
; Optional global provider key, same as dns,key
provider_key =
; Domain to masquerade as when sending mail
; Affects "Message-ID" generation + non-fully qualified addresses
sending_domain = "${HOSTNAME}"
; rspamd installed on server. Used for spam filtering + DKIM signing requests
rspamd_present=false
; Permit users to forward catch-alls elsewhere. This carries disastrous
; consequences, but may be useful for bulk imports from a source that allows such behaviors
forwarded_catchall = false

[mysql]
; ProxySQL in front of MySQL. Requires updating authentication on both ends.
; Only available for localhost/127.0.0.1
proxysql=false
; Limit connections per user to server. Setting to higher numbers
; may mask underlying problems (over quota, poorly optimized queries).
; 10 is suitable for sites serving > 250 GB/month
concurrency_limit=20

[pgsql]
; Limit active connections to a database. Unlike MySQL, enforcement is per database
; instead of per user. Setting to a high value may mask underlying problems as above.
database_concurrency_limit=20

[quota]
; Storage multiplier if over quota
storage_boost=2
; Time in seconds amnesty is applied
storage_duration=43200
; Min wait time, in seconds, between requesting amnesty
storage_wait=2592000

[domains]
; Nameserver verification check before allowing a domain
; to be added. Enable on multi-user setups to prevent a user
; from adding google.com and routing all server mail for
; google.com to the user account.
dns_check=1
; Notify admin whenever a domain is added to any account.
; Setting dns_check and notify to false is only recommended
; on a single-user installation.
notify=0

[ssh]
; Include embedded Terminal for users
embed_terminal=1
; Enable users to run daemons
user_daemons=true
; Default theme to use for shellinabox
theme=default

[auth]
; When using a multi-server reverse proxy, use this URL
; to query the domain database server
; See https://github.com/apisnetworks/cp-proxy
;  +  Auth::Redirect
server_query=
; When redirecting a login request elsewhere, format the
; redirection as this FQDN, e.g.
; if server = foo and server_format = <SERVER>.apiscp.com, then
; redirect: foo.apiscp.com
; Leaving blank implies SERVER_NAME
; Setting server_format is necessary for <username>/<server> support
server_format=
; Minimum acceptable password length
min_pw_length=7
; Force password requirements check, implies min_pw_length
pw_check=1
; Allow admin API commands, add/delete/edit/suspend/activate/hijack
; Disable to provide added security if a permission exploit were discovered
admin_api=true
; Allow sites whose billing,invoice matches another site's biling,parent_invoice
; to SSO into the account
subordinate_site_sso=true
; Allow suspended accounts the ability to login to the panel?
suspended_login=true
; Retain password in session for SSO to webmail
retain_ui_password=true
; Special key to encrypt all seen sessions. In multi-server setups this value
; MUST be the same across ALL servers. On new installs this is set automatically
; by the Bootstrapper
secret=
; Changes that affect self-service under Account > Summary
; Allow username changes
allow_username_change=true
; Allow domain changes
allow_domain_change = true
; Allow database prefix changes
allow_database_change = true
; Maximum number of IP restrictions an account may set.
; Includes range and single addresses. Set to -1 to cap
; to global limit (50). Set to 0 to disallow users from setting
ip_restriction_limit=50

[billing]
; All accounts attached with this invoice are considered "demo" and restricted.
demo_invoice=APNS-HOSTING-1111111111111111

[antivirus]
; ClamAV is installed on system
installed=true

[misc]
; Base URL for all support articles. If you would like to self-host
; contact license@apisnetworks.com for information on mirroring KB
kb_base=https://kb.apiscp.com
; In multi-panel installations, use cp_entry as reverse proxy
; See https://github.com/apisnetworks/cp-proxy
cp_proxy=
; Aggregate system status portal used in login portal. Requires Cachet
; See https://cachethq.io and set to URL before api/
sys_status=

[telemetry]
; Enable platform learning
enabled=0
; Auto-tune database on extension update
autotune=true
; Maximum memory consumption. Leave undefined for autodetection.
; When unit omitted, assumed MB.
memory_consumption=
; Perform routine compressions on metric data older than timespec
; Values older than this are averaged out into COMPRESSION_CHUNK windows
compression_threshold="7 days"
; Chunk data older COMPRESSION_THRESHOLD
compression_chunk='1 hour'
; Archival compression prevents modification of data past 48 hours
archival_compression=true
; Merge duplicate records by value older than compression_chunk
merge_duplicates=false

;;;
;;; Cron
;;;
[cron]
; Minimum cron resolution time, in seconds, for apnscpd
resolution=60
; Maximum number of workers, each worker takes up between 24-32 MB
max_workers=1
; Disable Horizon and use a primitive single-runner queue manager, frees up 40-60 MB
low_memory=false
; As a percentage of run-queue capacity. Run if 1-minute load < <CPU Count> * <LOAD_LIMIT>
load_limit=0.75

;;;
;;; Account management
;;;
[opcenter]
; default plan name, symlinks from plans/.skeleton
default_plan="basic"
; Configuration directives not listed in plans/default/<svc>
; will terminate execution
strict_svc_config = 1
; Relative to resources/ or an absolute path
plan_path = templates/plans
; require IP addresses be bound to the server before allocating to site
ip_bind_check=true

;;;
;;; Server brute-force deterrent
;;;
[rampart]
; Default jail prefix for all fail2ban jails`
prefix = "f2b-"
; Default driver for rampart, iptables or ipset
driver = ipset
; Allow up to n whitelisted IPs per site.
; -1 allows unlimited, 0 disables, n > 0 to cap
delegated_whitelist = 0

;;;
;;; Enable FTP services
;;;
[ftp]
enabled = 1

;;;
;;; Account resource enforcement
;;;;
[cgroup]
; location for cgroup controllers
home="/sys/fs/cgroup"
; default controller support
controllers=memory,cpu,cpuacct,pids,blkio

;;;
;;; Apache
;;;
[httpd]
; Bind to all available interfaces
; Requires manual configuration in httpd-custom.conf
all_interfaces=true
; Window to allow multiple HTTP build/reload requests
; to coalesce. Set to "now" to disable.
reload_delay='2 minutes'
; Place all sites in PHP-FPM jails by default
; Each account occupies approximately 40 MB
use_fpm=true
; Allow users to switch between system user and self
fpm_user_change=true
; Default port for non-SSL connections. Leave empty disable
; Secondary configuration in httpd-custom.conf required
nossl_port=80
; Default port for SSL connections. Leave empty disable
; Secondary configuration in httpd-custom.conf required
ssl_port=443


;;;
;;; Server-to-server xfer
;;;
[migration]
status_email = apnscp@${HOSTNAME}

;;;
;;;
;;;
[webapps]
; Comma-delimited list of app names to blacklist
blacklist = magento

;;;
;;;
;;;
[bandwidth]
; Bandwidth is rounded down and binned every n seconds
; Smaller resolutions increase storage requirements
resolution=180
; Bandwidth stopgap expressed in percentage
; 100 terminates a site when it's over alloted bandwidth
; Default setting is 200 which suspends the site when it has exceeded 200% its bandwidth
; 95 would suspend a site when it's within 5% of its bandwidth quota
stopgap = 125
; Bandwidth notification threshold expressed in percentage
; As a sanity check, bandwidth_notify <= bandwidth_stopgap
; Setting 0 would effectively notify every night
notify = 90
```
