---
title: Scopes index
---

**name:** apache.block10  
default: true  
info: Disable or enable HTTP/1.0 access  
settings:  
- true
- false

**name:** apache.brotli  
default: false  
info: Disable or enable Brotli output compression  
settings:  
- true
- false

**name:** apache.cache  
default: disk  
info: Change upstream HTTP caching method  
settings:  
- memory
- disk
- memory+disk
- false

**name:** apache.cachetype  
default: explicit  
info: Change upstream HTTP caching strategy  
settings:  
- implicit
- explicit

**name:** apache.dav  
default: false  
info: Enable DAV via HTTP  
settings:  
- true
- false

**name:** apache.evasive  
default: mixed  
info: General mod_evasive configuration  
settings: string  

**name:** apache.evasive-static-bypass  
default: false  
info: Ignore mod_evasive counters for static resources  
settings: bool  

**name:** apache.evasive-whitelist  
default: 127.0.0.1  
info: Add whitelist to mod_evasive  
settings: string  

**name:** apache.evasive-wordpress-filter  
default: false  
info: Apply strict mod_evasive counters on protected WordPress resources  
settings: bool  

**name:** apache.php-multi  
default:  
  '7.2': system  
info: Add native PHP builds  
settings: string|array  

**name:** apache.php-version  
default: '7.4'  
info: Change system-wide PHP version  
settings: string  

**name:** apache.ports  
default:  
- 80
- 443
info: Set Apache ports  
settings: array  

**name:** apache.strict-directives  
default: true  
info: Encountering an unknown directive results in a fatal error  
settings:  
- true
- false

**name:** apache.system-directive  
default: ''  
info: Set Apache directive (-DNAME)  
settings: string  

**name:** argos.auth  
default: []  
info: Set Argos backend credentials  
settings: string|array  

**name:** argos.backend  
default: pushover  
info: Change standard Argos notification relay  
settings: null  

**name:** argos.backend-high  
default: pushover  
info: Change high priority Argos notification relay  
settings: null  

**name:** argos.backends  
default:  
- default
- high
info: View Argos backends  
settings: null  

**name:** argos.config  
default: mixed  
info: Set an Argos directive. Provide backend or "" to apply to all backends  
settings: mixed  

**name:** argos.init  
default: false  
info: Initialize Argos configuration  
settings: boolean  

**name:** argos.test  
default:  
- Test message from Argos
- default
info: Relay a test message through optionally named backend  
settings: string ?string  

**name:** cp.api  
default: true  
info: Toggle apnscp SOAP API  
settings: bool  

**name:** cp.bootstrapper  
default: mixed  
info: Set Bootstrapper parameter  
settings: mixed  

**name:** cp.config  
default: []  
info: Manipulate config.ini directly  
settings: array  

**name:** cp.debug  
default: false  
info: Toggle apnscp debug mode  
settings: bool  

**name:** cp.flare-check  
default: 'true'  
info: Enable periodic emergency update checks  
settings:  
- bool

**name:** cp.headless  
default: false  
info: Disable apnscp frontend  
settings: bool  

**name:** cp.license-renew  
default: null  
info: Get license days-until-expire or force renewal of license  
settings: int  

**name:** cp.low-memory  
default: false  
info: Enable low memory mode for miserly installs  
settings: bool  

**name:** cp.nightly-updates  
default: false  
info: Enable apnscp automatic updates  
settings: bool  

**name:** cp.restart  
default: false  
info: Restart apnscp  
settings: bool  

**name:** cp.update-policy  
default: major  
info: apnscp update policy  
settings:  
- edge
- minor
- major
- all
- false

**name:** cp.update-schedule  
default: system  
info: Set cp update window  
settings:  
- system
- 'null'
- calendar spec

**name:** cp.workers  
default:  
  max: 5  
  min: 1  
  start: 1  
info: Configure apnscp backend workers  
settings: array  

**name:** cron.notify  
default: root  
info: Set notification email for nightly cron tasks  
settings: string  

**name:** cron.start-range  
default: 3-22  
info: 'Run cronjobs during these hours. Current time: 17:37 EST  

  Hint: default timezone can be changed with system.timezone'  
settings: int range  

**name:** dns.default-provider  
default: builtin  
info: Default DNS provider assigned to accounts  
settings: string  

**name:** dns.default-provider-key  
default: ''  
info: Default DNS provider authentication token  
settings: string  

**name:** dns.ip4-pool  
default:  
- 136.37.24.241
info: Set Ip4 namebased pool  
settings: array  

**name:** dns.ip4-proxy  
default: null  
info: Set public IP address. See docs/NAT.md  
settings: string  

**name:** dns.ip6-pool  
default:  
- 2001:48f8:9021:f2d:825:ccf1:8013:b6ab
info: Set Ip6 namebased pool  
settings: array  

**name:** dns.ip6-proxy  
default: null  
info: Set public IP address. See docs/NAT.md  
settings: string  

**name:** fs.tmp-mount  
default:  
  attrs: mode=1777,strictatime,nosuid,nodev,noexec,noatime,nr_inodes=5000000,size=3789M  
  inodes: 5000000  
  size: 3789  
info: Set /tmp mount parameters  
settings: array  

**name:** ftp.enabled  
default: true  
info: Enable FTP on server  
settings: bool  

**name:** mail.enabled  
default: true  
info: Enable mail reception on server  
settings: bool  

**name:** mail.smart-host  
default: false  
info: Set next hop for all outbound email  
settings: bool|hostname username password  

**name:** mail.spam-filter  
default: spamassassin  
info: Mail spam filter  
settings:  
- spamassassin
- rspamd
- false

**name:** net.hostname  
default: testing.apisnetworks.com  
info: Change system hostname  
settings: string  

**name:** net.nameservers  
default:  
- 1.0.0.1
- 1.1.1.1
info: Get nameservers for server  
settings: array  

**name:** net.ssl  
default: testing.apisnetworks.com  
info: Request SSL certificates for the following hosts  
settings: string|array  

**name:** opcenter.account-cleanup  
default: true  
info: Periodically clean-up accounts on the server  
settings: string|false  

**name:** rampart.blacklist  
default: ''  
info: Temporarily blacklist an IP address in Rampart  
settings: string  

**name:** rampart.fail2ban-whitelist  
default: 127.0.0.1/8  
info: Whitelist an IP address from Rampart  
settings: string  

**name:** rampart.whitelist  
default: 127.0.0.1/8  
info: Whitelist an IP address from Rampart brute-force detection  
settings: string  

**name:** ssl.debug  
default: false  
info: Toggle Let's Encrypt debug mode  
settings: bool  

**name:** ssl.request  
default: testing.apisnetworks.com  
info: Request SSL certificates for the following hosts  
settings: string|array  

**name:** system.integrity-check  
default: false  
info: Run a thorough platform integrity check  
settings: bool  

**name:** system.kernel  
default: system  
info: Change default kernel  
settings:  
- system
- experimental
- stable

**name:** system.monthly-integrity-check  
default: true  
info: Perform a full platform integrity check every month  
settings: bool  

**name:** system.sshd-port  
default: 22  
info: Set SSH ports  
settings: int|array  

**name:** system.sshd-pubkey-only  
default: false  
info: Restrict SSH access to public key  
settings: bool  

**name:** system.timezone  
default: America/New_York  
info: Change system timezone  
settings: Any timezone  

**name:** system.update-policy  
default: default  
info: Yum update policy  
settings:  
- default
- security
- security-severity
- minimal
- minimal-security
- minimal-security-severity
- false

**name:** system.virus-scanner  
default: clamav  
info: Set system AV scanner  
settings: string  

**name:** system.watchdog-load  
default: 50  
info: Set watchdog load threshold  
settings: int > 0  

