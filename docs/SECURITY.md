# Security

All security notices should be sent to security@apisnetworks.com. Turnaround time is within 24 hours. The following are considerations acknowledged during development of ApisCP.

## Passwords

### Storage

Passwords are stored using native password formats. Account passwords are stored using a custom [HMAC SHA512](https://access.redhat.com/articles/1519843) hashing process with 5,000 rounds, which puts its complexity approximate to bcrypt. Once an account password is in the system, it cannot be recovered.

Database passwords are randomly chosen from a pool of 62 characters (a-Z0-9) with 16 characters. This provides enough variation to defeat contemporary password cracking. These passwords are stored in plain-text in the user's home directory. These files are restricted read access to anyone beside the owner.

#### UI storage

Passwords are stored within the active session when a user logs into control panel if **[auth]** => *retain_ui_password* is set to true (default). Passwords are encrypted using AES-256-GCM (RFC5288). Authentication tag is stored as a client session cookie. **[auth]** => *secret* serves as its encryption key. __debugInfo() is overriden to disallow any object dumps that would expose its initialization vector. Sessions are stored in a MySQL database with access only to the ApisCP user; this user is configured with a randomly generated 30-character password. ApisCP itself is limited access except to the ApisCP system user, which is unique. An attacker would need both access to the client's browser as well as server configuration to decrypt a password. Disabling password storage will disable SSO to webmail, but otherwise will not affect performance.

### Password changes

Notifications are generated whenever a password is changed. If the user changes their own password, then a notice is generated to the email address on record (`common:get-email()`). Passwords for roles subordinate to the active user notify the supervising role. Notifications are summarized below.

| Role      | Changes | Notifies |
| --------- | ------- | -------- |
| Appliance | Self    | Self     |
| Appliance | Site    | Site     |
| Appliance | User    | Site     |
| Site      | Self    | Self     |
| Site      | User    | User     |
| User      | Self    | Self     |

### Password resets

Resets are different from a change in that the end-user has no control over the password generated. A reset is useful to quickly lock out a potentially compromised account, forcing a new password for the target user. A notice is dispatched to the email address on record for the user, if set, as well as reported in postback. Resets may be engaged as Appliance Administrator under **Nexus** or for Site Administrators under **User** > **Manage Users**. Likewise `auth:reset-password($user, $site)` will reset a password for the user. `$user` may be nulled if the Site Administrator is desired.

## API access

API authentication is rate-limited to prevent brute-force attacks. Authentication is enforced through Anvil, which is configurable via config.ini ([anvil] section). Once an IP address exceeds the threshold, it is blocked for *ttl* seconds; the default is 15 minutes. API access may be disabled by setting **[soap]** => *enabled=0* in config.ini

## Remote access

Panel access is rate-limited to prevent brute-force attacks. In addition to limiting the number of login attempts before blocking a user (see config/config.ini => **[anvil]** section), session fixation attempts are also counted. Violating either password or session fixation beyond the configured threshold (see **[anvil]** => *limit*) will result in a rejection up to *ttl* seconds. The default is 20 attempts in 15 minutes.

Anvil provides an exponential backoff algorithm as it approaches 20 attempts to delay login attempts.

Other services, including FTP, SSH, and mail use fail2ban to restrict unauthorized access.

### Restricting authorization

A second factor of authentication can exist in the form of IP restrictions. IP restrictions may be set in **Account** > **Settings** > **Security** or programmatically using `auth:restrict-ip($ip, $gate = NULL)`. An authentication gate, if specified, applies IP restriction to a module of ApisCP. Possible gates include: `UI`, `SOAP`, `DAV`, and `CLI`. When no gate is specified restriction applies to all gates. `auth:remove-ip-restriction($ip, $gate = NULL)` can be used to remove such restrictions. `$ip` accepts either an IP address or CIDR.

A check occurs concomitant with password validation. An IP-based failure is treated the same way internally as a password failure.

::: warning All-or-nothing enablement
Authorizing access to *any* IP address enables this second factor of authentication to all gates even if 1 gate is specified.
:::

```bash
cpcmd -d domain.com auth:get-ip-restrictions
# Show all IP restrictions, none listed all IPs can login
cpcmd -d domain.com auth:restrict-ip 64.22.68.1/24 UI
# Only 64.22.68.1/24 can login to the UI
# All IPs can login to other services
cpcmd -d domain.com auth:get-ip-restrictions UI
# Only 1.2.3.4 can login to all services
# 64.22.68.1/24 can still login to only UI
cpcmd -d domain.com auth:restrict-ip 1.2.3.4
# Remove 1.2.3.4 restriction
cpcmd -d domain.com auth:remove-ip-restriction 1.2.3.4
```

### Forcing HTTPS

By default both HTTP and HTTPS are exposed remotely in the UI. `cpcmd scope:set cp.config frontend https_only true` will disable remote HTTP ports (2077, 2082) requiring HTTPS. HTTP-only communication is intended as a bridge to accommodate new users to ApisCP when a self-signed certificate is present, but should be disabled once familiar. 

Unencrypted HTTP traffic over loopback is still permitted such as with cp-proxy.

## setuid in synthetic roots

All accounts are placed in synthetic roots, which are built up from layers in `/home/virtual/FILESYSTEMTEMPLATE`. It is possible, albeit unlikely, for an attacker to gain elevated permissions through a rogue setuid binary. The binary would need to be placed by root in `/home/virtual/FILESYSTEMTEMPLATE/<service>` and not part of regular RPM packages, which are updated automatically using the Yum Synchronizer built into ApisCP.

setuid when copied by non-root lose their setuid flag.

## /etc/passwd, /etc/shadow

All accounts are placed in synthetic roots. /etc/passwd is constructed of relevant system users + users created within the root. All non-system users possess a unique uid. All non-system users inherit the gid of the account. Any access in /etc/passwd is relevant to that account alone.

Likewise, /etc/shadow contents reflect passwords of users in the account and not other users elsewhere.

## Geolocation

**New in 3.2.6**  
Maxmind GeoIP2 and GeoLite2 City services may be used to provide geolocation services to authentication access notices (credential changes, unrecognized devices). GeoIP2 is an [API service](https://www.maxmind.com/en/geoip2-precision-services) that may be configured using `auth.geoip-key` [Scope](admin/Scopes.md). GeoIP2 is a paid service from Maxmind. 

```bash
cpcmd scope:set auth.geoip-key '[id:1234,key:key-name]'
```

GeoLite2 is a free database hosted on-premise that allows similar geolocation data. After [registering](https://dev.maxmind.com/geoip/geoip2/geolite2/) for access to the database, locate `GeoLite2-City.mmdb` in `/usr/local/apnscp/resources/storehouse`. Registration is required to consent to various privacy/marketing regulations.

ApisCP will prefer GeoIP2 if both are provided.

## PHP Restrictions

### Normal operation

PHP runs as a jailed PHP-FPM process that runs setuid after binding itself to the corresponding cgroup controllers but before launching `php-fpm` process. PHP-FPM can either run as a separate system user (`apache`) or same-user as is a common setup in cPanel/Plesk-based systems. PHP-FPM runs in a jail that is localized to the [synthetic filesystem](admin/Filesystem.md) root and moreover, mounted with its own /tmp directory, restricts write-access to /etc, /boot, and /usr as well as mounts a private device namespace. 

### Low-memory mode

PHP is run as an ISAPI for efficiency reasons when `has_low_memory` is enabled in [Bootstrapper](admin/Bootstrapper.md). Several necessary safeguards are in place to combat unwanted malicious activity.

All accounts are bound by open_basedir restrictions. This restricts which directories native PHP functions can descend. By default, access is restricted to the synthetic root and a few globally disposable system directories.

### Common measures

1. Dangerous binaries are restricted execute from the web server through ACLs. These include binaries such as rm, mv, cp, cat, whoami, perl, python, php, and others that have no reasonable usage from a PHP script. pyenv/rbenv/goenv within `FILESYSTEMTEMPLATE/ssh/usr/local/share` are also revoked access. Users that need to run these binaries are encouraged to look up the comparable PHP function (mv => rename, rm => unlink, cat => file_get_contents) or run PHP as a CGI, which inherits the uid/gid of the script. This runs nightly via `/etc/cron.daily/99lockdown_procs` and so long as Yum Synchronizer maintains a hardlink of the file, which it will, then the ACLs apply both to the binary in the system-wide location as well as filesystem synthetic root.

2. Because all processes except for PHP operate within a synthetic root, discretionary access controls differ in what "world" means. world, in this context, is apache. group is any member of the account. In ISAPI mode, setting a folder 707 ensures that both the web server has write access as well as the owner. In PHP-FPM mode, a folder must have group access or have ACLs bestowed to allow write-access by Apache.

   ApisCP implements a facility called "[Fortification](admin/Fortification.md)" to simplify this process. An application that is fortified is bestowed world read/write/execute permissions, which solely entails the web server. Any file created by the web server is tagged with that system ID, which makes developing an audit trail (file_audit API command) very easy. Moreover, unless PHP application files are explicitly given world read, write permission, PHP can *never* write to these files.

   It is very import to be judicious of your use of permissions. Fortification profiles exist for Wordpress, Joomla, Drupal, Magento, and Laravel. Fortification profiles can be developed dynamically by selecting **Web** > **Web Apps** > *Select Site* > **Fortification** > **Web App Learning Mode** within ApisCP.
   
   Applications that do not have built-in Fortification profiles can be easily adapted using [Web App Manifests](admin/WebApps.md#ad-hoc-apps).

## Passenger

Passenger runs all Node, Python, and Ruby processes within their respective account root. Any output generated to stdout/stderr is logged to `/var/log/httpd/passenger/passenger.log`. This is a global log file readable by any user. Be mindful of logging any sensitive data to stdout/stderr during startup.

Running Passenger in standalone mode (`gem install passenger ; passenger -e builtin start`) will place the apps within the confines of the account and not rely upon writing to passenger.log. These applications
are not managed automatically, so extra care must be given to ensure they startup/run as expected.

## Disabled Apache features

There are a variety of side-channel attacks in Apache that rely on non-essential features. All of the following attacks are disabled by default.

### Plain-text symlink disclosure

A symbolic link is a file that refers to another file. For example, a symbolic link named `index.html` can be created that refers to `config.php`. Accessing `index.html` would render `config.php` in plain-text effectively bypassing PHP. If this file contained sensitive information, such as database credentials, then it would be visible over a HTTP request. Apache ships with `+SymLinksIfOwnerMatch -FollowSymLinks` as its options and explicitly forbids `+FollowSymLinks` as an override. This allows for the owner of a file to create a symbolic link to it, but disallows other users to create a symbolic link to it.

Illegal usage: `Options +FollowSymLinks`
Placing this in .htaccess will result in a 550 error. It is not advised to allow users to override this as the decision should be at the discretion of the administrator configuring a server, not an application that should be platform-neutral.

Valid usage: `Options -SymLinksIfOwnerMatch`
Such usage disables following symbolic links within the directory and all inheritable subdirectories.

Likewise `Options all` is invalid because the "all" superclass implies `+FollowSymLinks`.

## SSI subrequest traversal

Server side includes are enabled with mod_includes and has little relevance in modern stacks. SSIs are a wayward effort to implement templating in static HTML files. Each SSI request generates an internal subrequest to resolve the link, which when paired to a location will result in information disclosure in the same fashion as the symlink disclosure above. For example, consider the following:

*index.foo*

```html
This file is <!--#fsize file="victim" --> bytes.
File contents:
<!--#include virtual="victim" -->
```

Create `victim` as a symlink to `/home/virtual/site12/fst/var/www/html/wp-config.php` or anywhere for that matter.

```apache
<Files "index.foo">
  Header set Content-Type "text/html"
  Options +Includes
  SetOutputFilter INCLUDES
</Files>
```

Visit /index.foo to view the file size + contents of the referent file of `victim`. Includes are disabled by default and should be enabled with extreme caution.

## DAV

DAV allows write-access by the web server. ApisCP integrates DAV support when enabled via **Web** > **WebDAV**. Enabling DAV also requires configuring authentication + authorization to deny untrusted third-parties from uploading arbitrary files, such as a web shell.

```bash
# Enable WebDAV support
cpcmd scope:set apache.dav true
```

For each resource that DAV is enabled, create a .htaccess file with authentication/authorization directives that control access within the respective directory:

```apache
AuthType Basic
AuthName "By Invitation Only"
# Optional line:
AuthBasicProvider dbm
AuthUserFile "/var/www/.htpasswd"
Require valid-user
```

`/var/www/.htpasswd` is generated with `htpasswd`. It controls which users are permitted to use the resource via password authentication. Passwords are secured in a safe, hashed format (bcrypt, cost 5).

```bash
htpasswd /var/www/.htpasswd someuser
# Enter the password at the prompt
```

Now "someuser" has access to the DAV location in which the above .htaccess is placed.

## Client encryption

SSLv2 and SSLv3 are disabled with all recent software releases in the last 5 years. TLS v1.0 and v1.1 have recently become deprecated with Mozilla removing TLSv1.0 and TLSv1.1 beginning March 30. TLSv1.2, released in 2008, is mature and well tolerated by many clients. Two notable exceptions: Internet Explorer did not adopt until v11 in 2013 and Android 5.0+ released in 2014. 

TLSv1.0 became a PCI compliance violation as of  June 30, 2018. TLSv1.1 is still to be determined, but will indubitably fall under the same violation in due time. TLSv1.0 and TLSv1.1 are disabled in ApisCP as of March 30, 2020.

To enable these insecure protocols (SSLv2, SSLv3 are always disabled), use the following scopes:

```bash
cpcmd scope:set apache.insecure-ssl true
cpcmd scope:set mail.insecure-ssl true
```

TLS compatibility may be enabled on a service-by-service basis for mail using the following Bootstrapper variables:
* **postfix_insecure_ssl**: enable TLSv1.0/v1.1 for SMTP/submission (25, 587)
* **dovecot_insecure_ssl**: enable TLSv1.0/v1.1 for IMAP/POP3 (143, 110)
* **haproxy_insecure_ssl**: enable TLSv1.0/v1.1 for SNI client termination (465, 993, 995)

```bash
# Same as mail.insecure-ssl Scope
cpcmd scope:set cp.bootstrapper postfix_insecure_ssl true
cpcmd scope:set cp.bootstrapper dovecot_insecure_ssl true
cpcmd scope:set cp.bootstrapper haproxy_insecure_ssl true
upcp -sb mail/configure-postfix mail/configure-dovecot software/haproxy
```

## Previous disclosures

- [AP-01/AP-07](https://hq.apiscp.com/ap-01-ap-07-security-vulnerability-update/) disclosures (July 2019; courtesy Rack911 Labs)