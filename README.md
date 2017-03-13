# ![Apis Networks](https://apisnetworks.com/images/logo/apnscp-40px.png)

# Requirements
apnscp's minimum requirements:
* Minimum CentOS 7.0 or RHEL 7.0
* 768 MB RAM
* 500 MHz processor

# Limitations
* Does not support IPv6

## Recommended Configuration
* At least 1 GB RAM for without cache offload, 2 GB with cache offload
* 2 GHz processor

# Installation
Refer to `INSTALL` for installation instructions.

# Configuration
apnscp configuration is managed through `conf/` within its installation directory, `/usr/local/apnscp` by default. Two files require configuration before usage:
* database.yaml - cp, platform, and plugin database configuration
* auth.yaml - miscellaneous authentication providers

## Runtime configuration
`config.ini` consists of runtime parameters 

## Authentication providers
apnscp uses a variety of third-party modules to enhance its presentation. The following providers are integrated and recommended that you setup an account with each to enhance your experience:
* Twilio: SMS notifications
* MaxMind: GeoIP location for unauthorized login notices
* PushOver: push notifications of server events to phone

## Initial Startup
apnscp will attempt to bootstrap SSL on first run using Let's Encrypt. To do this, the machine name must be reachable.

### Changing SSL Hostnames
Additional hostnames beyond the machine name (`uname -n`) can be configured by editing letsencrypt -> additional_certs in config.ini. To activate changes, remove the directory `vendor/data/acme-client/accounts/live/MAIN`, then restart apnscpd.

## Surrogates
**Surrogates** are delegated modules that are loaded in lieu of modules that ship with apnscp. Surrogates are located in `lib/modules/surrogates` and are named after the module in which they delegate. A surrogate should extend the module for which it delegates, but doesn't have to. In such situations any method not explicitly implemented in the surrogate would not be visible to any calling method.

> **Remember**: New surrogates are not loaded until the active session has been destroyed via logout or other means

```php
<?php
	class Aliases_Module_Surrogate extends Aliases_Module {
		/**
		 * Extend nameserver checks to include whitelabel nameservers
		 */
		protected function domain_is_delegated($domain)
		{
			$myns = [
			    'ns1.myhostingns.com',
				'ns2.myhostingns.com',
				'ns1.whitelabel.com',
				'ns2.whitelabel.com'
			];
			$nameservers = $this->dns_get_authns_from_host($domain);
			foreach($nameservers as $nameserver) {
				if (in_array($nameserver, $myns)) {
					return 1;
				}
			}
			return parent::domain_is_delegated($domain);
		}
	}
```
## Managing Accounts
### Adding Accounts
New accounts may be added from the terminal using `add_domain.sh`, which is an interactive dialog for creating new accounts. Accounts may also be added freeform using `AddDomain` that accepts multiple parameters, e.g. `AddDomain -c siteinfo,domain=example.com -c siteinfo,admin_user=example -c siteinfo,passwd=mypassword -c mysql,dbaseprefix=debug`. Any value not specified will inherit the plan default in `/etc/virtualhosting/plans/default`.

### Hijacking Accounts
As root, you may override a user account to login using `temp_password DOMAIN`. A temporary password will be issued for 3 minutes allow you to login to the panel. Once the timer expires, the account password will be reset to its previously configured value. This may be repeated multiple times without resetting the original password; however, the 3 minute timer will not be reset.

### Command-line Utility
apnscp includes a command-line utility to interact with the panel called `cmd`. `cmd` accepts optional parameters -d and -u to impersonate a given domain and user. For example, to get the uptime as root: `cmd common_get_uptime`. To get the configured [admin email address](https://github.com/apisnetworks/apnscp-modules/blob/master/modules/common.php) for example.com, `cmd -d example.com common_get_admin_email`. To list files as user "secondary" on example.com in /tmp, the use `cmd -d debug.com -u secondary file_get_directory_contents /tmp`. 

Arrays are encapsulated using brackets ("[]") and hashes notated with a colon (":"). To grant SELECT , INSERT, and DELETE privileges on database "foo" for user "secondary" connecting over localhost on the account example.com, the following command would be used: `cmd -d debug.com sql_set_mysql_privileges secondary localhost foo "[select:1,insert:1,delete:1]"`

## Apache
### Fallback Interpreter
Apache runs as an ISAPI module embedded into PHP instead of PHP-FPM to reduce request latency and achieve higher throughput. Having only 1 interpreter limits legacy applications, but legacy applications should be shunned rather than shoehorned into a production environment. A secondary fallback interpreter, usually 1 or 2 versions lower is available on port 9000. 

* To enable fallback support for a given domain or site, use the apnscp command driver, cmd:
  `cmd -d <domain> php_enable_fallback`
* To disable fallback support, use disable_fallback:
  `cmd -d <domain> php_disable_fallback`

#### Configuring Fallbacks
Additional fallbacks may be configured by duplicating httpd-fallback-common.conf

## API Companion, Beacon
[![Beacon](https://apisnetworks.com/images/beacon/beacon.png)](https://github.com/apisnetworks/beacon)
Beacon is a scripting companion for apnscp that interfaces its API. Any user role may use it. Whatever apnscp exposes to a given role, Beacon too can interact with. Refer to the [Beacon repository](https://github.com/apisnetworks/beacon) to get started.

## Filesystem Template
**Filesystem Template** ("FST") represents a collection of read-only layers shared among accounts named after each service enabled. The top-most layer that contains read-write client data is called the **Shadow Layer**. Services live in ``/home/virtual/FILESYSTEMTEMPLATE`` and are typically hardlinked against system libraries for consistency.

### Restricting Updates
Restriction is done through ```etc/synchronizer.skiplist```. Modified system files, including user control files such as shadow, passwd, and group, are good candidates for inclusion into the skiplist. 

> Any files shared via ```/.socket``` that are linked to from ```/usr``` as a symbolic link should be present in the skiplist to prevent yum-synchronizer from deleting the file on package update.

### Populating FST
An initial population is done using ``yum-synchronizer``. All installed services are located in the system database in "site_packages". New services may be installed using `yum-sychronizer install PACKAGE SERVICE` where *SERVICE* is a named service under `/home/virtual/FILESYSTEMTEMPLATE` and corresponds to an installed service module.

### Breaking Links
A FST file may need to be physically separated from a system file when customizing your environment. For example, you may want to change `/etc/sudo.conf` in `/home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc` and keep it separate from the system sudo.conf that would be sourced when logging in as root.
* First, verify the file is linked:
    * ```stat -c %h /home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc/sudo.conf```
    * *A value greater than 1 indicates a hardlink elsewhere, likely to its corresponding system path. This is only true for regular files. Directories cannot be hardlinked in most   filesystems*
* Second, break the link:
    * ```cp -dp /home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc/sudo.conf{,.new}```
    * ```rm -f /home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc/sudo.conf```
    * ```mv /home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc/sudo.conf{.new,}```
    * *sudo.conf has now had its hardlink broken and may be edited freely without affecting /etc/sudo.conf. Running stat again will reflect "1".*

### Propagating Changes
Once a file has been modified within the FST, it is necessary to recreate the composite filesystem. `service fsmount reload` will dump all filesystem caches and rebuild the layers. Users logged into their accounts via terminal will need to logout and log back in to see changes. 

License
----
Unless otherwise specified, all components of apnscp and its subcomponents are (c) 2017 Apis Networks. All rights reserved. For licensing inquiries, contact license@apisnetworks.com
