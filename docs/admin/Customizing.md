---
title: Customizing ApisCP
---

ApisCP provides a variety of means to customize your environment. Each service is different and the means to configure it varies. Many services have files that are verboten, don't touch under any circumstance. They are periodically overwritten and the primary means to ensure what you run is what is developed.

## Apache

**⚠️ DO NOT TOUCH**: /etc/httpd/conf/httpd.conf  
**Customization file**: /etc/httpd/conf/httpd-custom.conf  

Additionally, module configuration may be inserted in `/etc/httpd/conf.d` to load or modify existing modules. Per-site configuration is located in `/etc/httpd/conf.d/siteXX` or `/etc/httpd/conf.d/siteXX.ssl` for SSL-specific context. By convention customizations are placed in a file named `custom` in these directories. To get the site ID of a domain use the [helper](CLI.md#get-site-id) command, `get_site_id`.

After making changes, `htrebuild` will compile Apache's modular configuration followed by `systemctl reload httpd` to reload the web server.

### Placeholder page
A placeholder page is created whenever an account, addon domain, or subdomain is created. Placeholders are always named "index.html" and reside in the respective [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/). Content is generated from a Blade file, which allows for customization prior to rendering of the placeholder.

Copy `/usr/local/apnscp/resources/templates/apache/placeholder.blade.php` to `/usr/local/apnscp/config/custom/resources/templates/apache/placeholder.blade.php` creating parent directories as needed. index.html may not be updated once written.

### Suspension page
All suspended accounts via [SuspendDomain](Plans#suspenddomain) redirect to `/var/www/html/suspend.html`. Suspension rules may be modified by adjusting the rewrite rules.

Copy `/usr/local/apnscp/resources/templates/apache/suspend-rules.blade.php` to `/usr/local/apnscp/config/custom/resources/tempaltes/apache/suspend-rules.blade.php` creating parent directories as needed.

A site once suspended will compile these rules into `/etc/httpd/conf/siteXX/00-suspend`. Rules will not be updated unless suspended again. `admin:collect()` provides a convenient way to do this.

```bash
yum install -y jq
cpcmd -o json admin:collect '[]' '[active:false]' | jq -r 'keys[]' | while read -r SITE ; do SuspendDomain $SITE ; done
```
### Evasive
**⚠️ DO NOT TOUCH**: n/aa  
**Customization file**: /etc/httpd/conf.d/evasive.conf or httpd-custom.conf

Alternatively consider the apache.evasive [Scope](Scopes.md), which provides error checking.

### mod_security
**⚠️ DO NOT TOUCH**: /etc/httpd/conf.d/mod_security.conf  
**⚠️ DO NOT TOUCH**: /etc/httpd/modsecurity.d/activated_rules/clamav.conf  
**Customization file**: /etc/httpd/modsecurity.d/ or httpd-custom.conf

### Pagespeed
**⚠️ DO NOT TOUCH**: /etc/httpd/conf.d/pagespeed.conf MANAGED BLOCK (#BEGIN/#END)  
**Customization file**: /etc/httpd/conf.d/pagespeed.conf or httpd-custom.conf

## ApisCP

**⚠️ DO NOT TOUCH:** /usr/local/apnscp/config/*  
**Customization file:** /usr/local/apnscp/config/custom/*  

ApisCP supports overriding views, apps, modules, and configuration. Modification is covered in detail in [PROGRAMMING.md](../PROGRAMMING.md).

::: tip
ApisCP was originally called APNSCP. Internally, in many places, the panel is still referred to as APNSCP. ApisCP is a bit easier to pronounce.
:::

### View overrides

All views may be copied into `config/custom/resources/views/<path>` from `resources/views/<path>`. Custom views take precedence, including all mail templates. Overriding `layout.blade.php` allows customization to the skeleton of all apps in ApisCP.

#### Layout

A master layout named "layout" is provided in `resources/views/`. As with all templates suffixed "blade.php", it utilizes [Blade](https://laravel.com/docs/5.6/blade). A theme-specific blade may override the master layout by creating an eponymous template in `config/custom/resources/views/`. For example, to override the "apnscp" theme, create a file named `config/custom/resources/views/apnscp.blade.php`. Inheritance is supported via `@extends("layout")` in addition to section injection.

### App overrides

Copy the app from `apps/<name>` to `config/custom/apps/<name>`.  Role menus, i.e. what is loaded when a corresponding user type logs in (admin, site, user) may be overridden as well. Menus are based on code under `lib/html/templateconfig-<role>.php`. Additional includes may be located under `config/custom/templates/<role>.php`. This is a sample extension for ApisCP when a billing module is configured to allow clients direct access to manage billing:

`config/custom/templates/site.php`:

```php
<?php

$templateClass->create_link(
        'Billing History',
        '/apps/billinghistory',
        cmd('billing_configured'),
        null,
        'account'
);

$templateClass->create_link(
        'Change Billing',
        '/apps/changebilling',
        cmd('billing_configured'),
        null,
        'account'
);

$templateClass->create_link(
        'Client Referrals',
        '/apps/referrals',
        cmd('billing_configured'),
        null,
        'account'
);
```

#### Hiding/removing existing apps

Apps populated as part of ApisCP may be hidden or removed from view using `hide()` and `remove()` respectively. Application ID is the basename from the URI path, i.e. for /apps/foo the application ID is "foo" and likewise "quuz" is the application ID for /apps/quuz.

`config/custom/templates/admin.php`:

```php
<?php
    // remove Nexus app from admin
    $templateClass->getApplicationFromId('nexus')->remove();
    // allow Dashboard access, but remove from side menu
    $templateClass->getApplicationFromId('dashboard')->hide();
```

### App view overrides

Any app that uses Blade templates (`views/` directory) is eligible to override components of the template structure. Create the same structure in `config/custom/apps/<name>` as is in `apps/<name>`. For example to override `apps/ssl/views/partials/certificate-detected.blade.php`, copy that file to `config/custom/apps/ssl/views/partials/certificate-detected.blade.php`. ApisCP will load the view from this location first. It is advisable to copy the entire application over (*App overrides*) as application structure may change between releases.

### Global constants

Constants may be overrode or added to global scope via `config/custom/constants.php`:

```php
<?php
        return [
                'BILLING_HOST_READ'   => $dbyaml['billing']['read']['host'],
                'BILLING_HOST_WRITE'  => $dbyaml['billing']['write']['host'],
                'BILLING_USER'        => $dbyaml['billing']['read']['user'],
                'BILLING_PASSWORD'    => $dbyaml['billing']['read']['password'],
                'BILLING_DB'          => $dbyaml['billing']['read']['database'],
                'BILLING_HOST_BACKUP' => $dbyaml['billing']['backup']['host'],
        ];
```

### DNS template overrides

DNS is generated from a base template in `resources/templates/dns`. Presently mail and dns templates are supported. For each template to override copy the respective template to `config/custom/resources/templates/dns/`. Validate DNS template consistency via `cpcmd dns:validate-template TEMPLATENAME`.

## Themes

New themes may be created and placed under `public/css/themes` and `public/images/themes`. The default theme may be changed with `cpcmd`:

```bash
cpcmd scope:set cp.config style theme newtheme
```

Per theme layouts may be set following the [layout](#layout) override mentioned above.

### Building themes

Grunt is used to build themes from the [SDK](https://github.com/apisnetworks/apnscp-bootstrap-sdk). Some [Sass](https://sass-lang.com/) knowledge is recommended. [Bootstrap](https://getbootstrap.com/docs/4.0/getting-started/introduction/) is also helpful to know but simple enough to learn as you go along. ApisCP is presently based on Bootstrap 4.0.

```bash
git clone https://github.com/apisnetworks/apnscp-bootstrap-sdk
pushd apnscp-bootstrap-sdk
npm install -D
env THEME=apnscp grunt watch
```
Now changes may be made to the "apnscp" theme in `scss/themes/apnscp`. It will also be necessary to put either the panel in debug mode using the *cp.debug* scope or by flagging the session as debug. Session is encoded in the browser session as `session.id`. Use this value with misc:debug-session to selectively enable debugging for this session:

```bash
# Enable debugging on session LETceXuAZ9p1MW0yPd7n1b3Btk9t9Weh
env DEBUG=1 misc:debug-session LETceXuAZ9p1MW0yPd7n1b3Btk9t9Weh
```
It's recommended to create a new theme by copying one of the existing themes. Default theme may be changed using `cpcmd scope:set cp.config style theme NEWTHEME`. Likewise run `env THEME=NEWTHEME grunt` to build a minified release of the theme prior to shipment. Debug sessions source non-minified assets.

### ApisCP configuration

All configuration must be made to `config/custom/config.ini`. [cpcmd](CLI.md#cpcmd) provides a short-hand tool to edit this file.

```bash
# Show all configuration
cpcmd scope:get cp.config
# Set configuration
cpcmd scope:set cp.config core fast_init true
```

Refer to [config.ini](https://gitlab.com/apisnetworks/apnscp/blob/master/config/config.ini) that ships with ApisCP for a list of configurables.

### HTTP configuration

All changes may be made to `/usr/local/apnscp/config/httpd-custom.conf`. After changing, restart ApisCP, `systemctl restart apiscp`

## Dovecot

**⚠️ DO NOT TOUCH:** /etc/dovecot/conf.d//apnscp.conf  
**Customization file:** /etc/dovecot/local.conf  

A few conflicting files in /etc/dovecot/conf.d are wiped as part of [Bootstrapper](https://github.com/apisnetworks/apnscp-playbooks/blob/master/roles/mail/configure-dovecot/defaults/main.yml#L9). These files will always be removed if found:

- 10-auth.conf
- 10-mail.conf

## fail2ban

**⚠️ DO NOT TOUCH:** /etc/fail2ban/*.conf   
**Customization file:** /etc/fail2ban/*.local, /etc/fail2ban/jail.d

Any file in fail2ban may be overridden with a corresponding `.local` file. It takes the same name as the source file, except it ends in `.local`.

*See also*
- [MANUAL 0.8](https://www.fail2ban.org/wiki/index.php/MANUAL_0_8#Configuration) (fail2ban.org) - covers configuration/override in detail

## Postfix

**⚠️ DO NOT TOUCH:** /etc/postfix/master.conf  
**Customization file:** /etc/postfix/main.cf, /etc/postfix/master.d

Postfix does not provide a robust interface to extend its configuration. /etc/postfix/master.cf, which is the service definition for Postfix, may not be updated as it is replaced with [package updates](https://github.com/apisnetworks/postfix).

Pay special adherence to [configuration variables](https://github.com/apisnetworks/apnscp-playbooks/blob/master/roles/mail/configure-postfix/vars/main.yml) in Bootstrapper. These are always overwritten during integrity check. To override these variables, create a special variable named `postfix_custom_config` in `/root/apnscp-vars-runtime.yml`. This is a dict that accepts any number of Postfix directives that takes precedence.

**Sample**

```yaml
postfix_custom_config:
  disable_vrfy_command: no
  vmaildrop_destination_rate_delay: 15
```

`postfix_custom_master_config` works similarly to `postfix_custom_config` except it is a string applied to /etc/postfix/master.cf. Additionally, per-site configurations, such as transports, may be added in `/etc/postfix/master.d`. Configuration **must end** in *.cf*. Any file prefixed with *siteXX-* is considered affiliated with the designated site and **will be removed** on site deletion. 

Do not assume these templates will be capable of Jinja templating in Ansible. Instead, the template must be statically generated at account creation/edit.

**Sample**

```
# Add SPF checking service, note this is for illustrative purposes and
# largely obviated by SpamAssassin and rspamd spam filters
postfix_custom_master_config: |-
  policyd-spf  unix  -       n       n       -       0       spawn
  	user=policyd-spf argv=/usr/bin/policyd-spf
```

**Sample**

```
# In /etc/postfix/master.d/site12.cf
# Add a custom smtp transport
mydomain.com-out unix  -       -       n       -       -       smtp
        -o smtp_helo_name=mydomain.com
        -o smtp_bind_address=64.22.68.2
```

Then to merge changes for both examples, run `upcp -sb mail/configure-postfix`.

## MySQL

**⚠️ DO NOT TOUCH:** /etc/my.cnf.d/apnscp.conf  
**Customization file:** /etc/my.cnf.d/*  

## PostgreSQL

**⚠️ DO NOT TOUCH:** *n/a*  
**Customization file:** /var/lib/pgsql/\<ver number>  

## PHP

**⚠️ DO NOT TOUCH:** /etc/php.ini MANAGED BLOCK (*# BEGIN/# END*)  
**Customization file:** /etc/phpXX.d/*  

ApisCP uses a managed block in /etc/php.ini. Any directives within this block will always be overwritten. To override any values within this block, make changes in /etc/phpXX.d/ where XX is the version major/minor of PHP. Note this affects global PHP settings. To change settings per site look into [php_value](https://kb.apiscp.com/php/changing-php-settings/) in either `.htaccess` or `siteXX/custom` mentioned above in Apache.

## rspamd

**⚠️ DO NOT TOUCH:** /etc/rspamd/local.d/*  
**Customization file:** /etc/rspamd/override.d/*  

For each file in local.d to override create a corresponding file in `override.d/`. This follows either [UCL](https://www.rspamd.com/doc/configuration/ucl.html) or JSON. When working with JSON, drop the leading + closing braces ("{", "}"). This is due to a parsing quirk of rspamd. An [example](https://github.com/apisnetworks/apnscp-playbooks/blob/d65ec74546f85eedec016684316c577975746e1f/roles/mail/rspamd/tasks/set-rspamd-configuration.yml#L29-L36) of reconstituting to valid JSON is available in the Github repository.

Additionally rspamd Playbook variables may be overrode in a similar manner to Postfix. In `/root/apnscp-vars.yml` add:

```yaml
rspamd_neural_custom_config:
  enabled: false
rspamd_actions_custom_config:
  add_header: 20
```

rspamd provides many configurables that don't require a direct override. Neural module for example is also conditionally enabled using `rspamd_enable_neural_training`. Be sure to refer back to [defaults](https://github.com/apisnetworks/apnscp-playbooks/blob/master/roles/mail/rspamd/defaults/main.yml) in mail/rspamd.

## SpamAssassin

**⚠️ DO NOT TOUCH:** *n/a*  
**Customization file:** /etc/mail/spamassassin/local.cf  

## SSH

**⚠️ DO NOT TOUCH:**  /etc/ssh/sshd_config MANAGED BLOCK (*# BEGIN/# END*)  
**Customization file:** /etc/ssh/sshd_config  

`sshd_config` may be modified. Do not edit the directives within `# BEGIN ApisCP MANAGED BLOCK` and `# END ApisCP MANAGED BLOCK`. Port and public key authentication may be modified with [Scopes](Scopes.md),

```bash
# Enable ssh daemon ports 22 and 58712
cpcmd config:set system.sshd-port '[58712,22]'
# Disallow password-based logins, public key only
cpcmd config:set system.sshd-pubkey-only true
```
