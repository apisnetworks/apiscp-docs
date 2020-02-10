# Security

All security notices should be sent to security@apisnetworks.com. Turnaround time is within 24 hours. The following are considerations acknowledged during development of ApisCP.

## Password storage

Passwords are stored using native password formats. Account passwords are stored using a custom [HMAC SHA512](https://access.redhat.com/articles/1519843) hashing process with 5,000 rounds, which puts its complexity approximate to bcrypt. Once an account password is in the system, it cannot be recovered.

Database passwords are randomly chosen from a pool of 62 characters (a-Z0-9) with 16 characters. This provides enough variation to defeat contemporary password cracking. These passwords are stored in plain-text in the user's home directory. These files are restricted read access to anyone beside the owner.

### UI password storage

Passwords are stored within the active session when a user logs into control panel if [auth] => retain_ui_password is set to true (default). Passwords are encrypted using AES-256-GCM (RFC5288). Authentication tag is stored as a client session cookie. [auth] => secret serves as its encryption key. __debugInfo() is overriden to disallow any object dumps that would expose its initialization vector. Sessions are stored in a MySQL database with access only to the ApisCP user; this user is configured with a randomly generated 30-character password. ApisCP itself is limited access except to the ApisCP system user, which is unique. An attacker would need both access to the client's browser as well as server configuration to decrypt a password. Disabling password storage will disable SSO to webmail, but otherwise will not affect performance.

## API access

API authentication is rate-limited to prevent brute-force attacks. Authentication is enforced through Anvil, which is configurable via config.ini ([anvil] section). Once an IP address exceeds the threshold, it is blocked for *ttl* seconds; the default is 15 minutes. API access may be disabled by setting **[soap]** => *enabled=0* in config.ini

## Remote access

Panel access is rate-limited to prevent brute-force attacks. In addition to limiting the number of login attempts before blocking a user (see config/config.ini => **[anvil]** section), session fixation attempts are also counted. Violating either password or session fixation beyond the configured threshold (see **[anvil]** => *limit*) will result in a rejection up to *ttl* seconds. The default is 20 attempts in 15 minutes.

Anvil provides an exponential backoff algorithm as it approaches 20 attempts to delay login attempts.

Other services, including FTP, SSH, and mail use fail2ban to restrict unauthorized access.

## setuid in synthetic roots

All accounts are placed in synthetic roots, which are built up from layers in `/home/virtual/FILESYSTEMTEMPLATE`. It is possible, albeit unlikely, for an attacker to gain elevated permissions through a rogue setuid binary. The binary would need to be placed by root in `/home/virtual/FILESYSTEMTEMPLATE/<service>` and not part of regular RPM packages, which are updated automatically using the Yum Synchronizer built into ApisCP.

setuid when copied by non-root lose their setuid flag.

## /etc/passwd, /etc/shadow

All accounts are placed in synthetic roots. /etc/passwd is constructed of relevant system users + users created within the root. All non-system users possess a unique uid. All non-system users inherit the gid of the account. Any access in /etc/passwd is relevant to that account alone.

Likewise, /etc/shadow contents reflect passwords of users in the account and not other users elsewhere.

## PHP Restrictions

PHP is run as an ISAPI for efficiency reasons. Several necessary safeguards are in place to combat unwanted malicious activity.

1. All accounts are bound by open_basedir restrictions. This restricts which directories native PHP functions can descend. By default, access is restricted to the synthetic root and a few globally disposable system directories.

2. Dangerous binaries are restricted execute from the web server through ACLs. These include binaries such as rm, mv, cp, cat, whoami, perl, python, php, and others that have no reasonable usage from a PHP script. pyenv/rbenv/goenv within `FILESYSTEMTEMPLATE/ssh/usr/local/share` are also revoked access. Users that need to run these binaries are encouraged to look up the comparable PHP function (mv => rename, rm => unlink, cat => file_get_contents) or run PHP as a CGI, which inherits the uid/gid of the script. This runs nightly via `/etc/cron.daily/99lockdown_procs` and so long as Yum Synchronizer maintains a hardlink of the file, which it will, then the ACLs apply both to the binary in the system-wide location as well as filesystem synthetic root.

3. Because all processes except for PHP operate within a synthetic root, discretionary access controls differ in what "world" means. world, in this context, is apache. group is any member of the account. Setting a folder 707 ensures that both the web server has write access as well as the owner.

   ApisCP implements a facility called "[Fortification](https://kb.apiscp.com/control-panel/understanding-fortification/)" to simplify this process. An application that is fortified is bestowed world read/write/execute permissions, which solely entails the web server. Any file created by the web server is tagged with that system ID, which makes developing an audit trail (file_audit API command) very easy. Moreover, unless PHP application files are explicitly given world read, write permission, PHP can *never* write to these files.

   It is very import to be judicious of your use of permissions. Fortification profiles exist for Wordpress, Joomla, Drupal, Magento, and Laravel. Fortification profiles can be developed dynamically by selecting **Web** > **Web Apps** > *Select Site* > **Fortification** > **Web App Learning Mode** within ApisCP.

There are future plans to include jailed PHP-FPM workers that run within the synthetic roots, but still run under a generic system ID. Presently, this ISAPI method outlined above is the only supported means.

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
