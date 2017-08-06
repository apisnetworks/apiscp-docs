---
layout: docs
title: Working with PHP
group: admin
lead: Working with apnscp's high performance PHP platform.
---
* ToC
{:toc}

PHP receives special treatment on apnscp to [maximize throughput](https://www.reddit.com/r/PHP/comments/4bi9a4/why_is_mod_php_faster_than_phpfpm/) and security. PHP is embedded directly in Apache
as an ISAPI module (mod_php) and runs as a non-privileged system user. Access to binaries is restricted by a [supplementary configuration](#binary-restrictions). 

## Fallback Interpreter
Apache runs as an ISAPI module embedded into PHP instead of PHP-FPM to reduce request latency and 
achieve higher throughput. Having only 1 interpreter limits legacy applications, but legacy applications should be 
shunned rather than shoehorned into a production environment. 
A secondary fallback interpreter, usually 1 or 2 versions lower is available on port 9000. 

* To enable fallback support for a given domain or site, use the apnscp command driver, cmd:
  `cmd -d <domain> php_enable_fallback`
* To disable fallback support, use disable_fallback:
  `cmd -d <domain> php_disable_fallback`

## Configuring Fallbacks
Additional fallbacks may be configured by duplicating `httpd-fallback-common.conf` in 
{{ site.data.paths.httpd-tmpl }} and creating a text file in /etc/httpd/conf/personalities
named after that personality. Enabled sites are stored under /etc/httpd/conf/virtual-*\<personality name\>*.

## PHP Write-Access
PHP operates on the principle of least privilege: write-access by PHP must be opted in by changing permissions on the respective files or directories. Running PHP under the same user ID as your account is a Very Bad Idea™. In the event of a hack, if PHP operates under your user ID, then the attacker now has permission to your email, ssh keys, and other confidential information. For this reason, PHP operates as a separate user.

apnscp provides write profiles for common 1-click applications including WordPress, Drupal, Joomla, and Magento called Fortification. For other applications, apnscp provides a **Learning Mode** accessible via Web > Web Apps > Fortify > Learning Mode.

Below summarizes Fortification for WordPress between min, max, and off modes.

![Fortification Summary](/images/fortification-diagram.png)

## Manual Write-Access

chmod can be used to allow write-access to specific files/directories. User "apache" is the only user with visibility outside the account and therefore in the user/group/other model of permissions, the only user in "other". All users created on the account reside under the same group. Permissions for those files may be safely chmoded to 717 or chmod o+rwx,

```bash
chmod -R o+rwx storage/
chmod -R 717 storage/
```

The first example only alters permissions on storage/ to other. The second resets permissions to give the user read/write/execute permissions as well as other.

{% callout warning %}
A lazy solution is to recursively change all files/directories to 777 recursively. Never do this. Use **Learning Mode** in apnscp. Only the files that have changed will be opted-in to allow write-access by apache via setfacl -m user:apache:7 -m d:user:*\<uid\>* *\<file\>*
{% endcallout %}

{% callout info %}
Remember, an attacker can stuff a backdoor into whatever user "apache" can write to; be judicious.
{% endcallout %}

## Path Restrictions

PHP is restricted to the filesystem base for the respective account with [open_basedir](http://php.net/manual/en/ini.core.php#ini.open-basedir). This is a compromise to how PHP operates, embedded as an ISAPI in Apache. Do not attempt to alter this restriction.


## Binary Restrictions
PHP is disallowed access to binaries listed in `config/apache-proc-revocation` in addition to 
binaries shipped with release. Use `apache-proc-revocation` to add any additional binaries to the revocation list. 
Any binaries provided in the list will have read, write, execute permissions revoked by user "apache". This process
runs nightly.