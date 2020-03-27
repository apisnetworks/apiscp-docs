---
title: Site and Plan management
---
Plans are service presets that may be assigned to an account. ApisCP contains a default present named "basic" that is a good fit for non-power users to balance resource consumption and accessibility.

# Management helpers

A variety of helpers exist to add, delete, modify, suspend, activate, import, and export a domain. These helpers have corresponding API commands in the [admin](https://api.apiscp.com/class-Admin_Module.html) module paired with each topic. *$flags* denote any feature, besides *-c service,param=value*, passed to the helper. Example of such flags are:

| Flag               | Scope        | Usage                                                        |
| ------------------ | ------------ | ------------------------------------------------------------ |
| --reset            | edit         | Resets site to plan defaults                                 |
| --dry-run          | edit, delete | Shows actions without performing                             |
| --backup           | edit         | Backup metadata prior to editing                             |
| --force            | delete       | Delete a domain in a partially edited state                  |
| --since=*timespec* | delete       | Delete domains suspended since *timespec* ("now", "last month", unix timestamp) |
| --reconfig         | edit         | Reconfigure all services implementing ServiceReconfiguration |
| --all              | edit         | Target all domains                                           |
| --help             | all          | Show help                                                    |
| --output=type      | all          | Set the output format. Values are "json" or unset            |

These flags may be passed to the API whenever *$flags* is an accepted parameter. Flags simply present are passed as '[name:true]' whereas flags that accept values are passed as '[name:value]'.

As an example, `EditDomain -c cgroup,enabled=0 --all` disables cgroup resource enforcement on all sites.

## AddDomain

`AddDomain` creates a site from command-line. Multiple parameters can be provided to alter the services assigned to an account. Nexus within the Administrative panel is a frontend for this utility.

### Basic usage

```bash
AddDomain -c siteinfo,domain=mydomain.com -c siteinfo,admin_user=myadmin
```

::: details
Creates a new domain named *mydomain.com* with an administrative user *myadmin*. The email address defaults to [blackhole@apiscp.com](mailto:blackhole@apiscp.com) and password is randomly generated.
:::

Let's alter this and set an email address, which is used to contact the account owner whenever a Web App is updated or when the password is changed. Let's also prompt for a password. But first let's delete *mydomain.com* because domains must be unique per server.

```bash
DeleteDomain mydomain.com
AddDomain -c siteinfo,domain=mydomain.com -c siteinfo,admin_user=myadmin -c siteinfo,email=hello@apisnetworks.com -c auth,passwd=1
```
::: details
ApisCP will prompt for a password and require confirmation. Email address will be set to [hello@apisnetworks.com](mailto:hello@apisnetworks.com).
:::

#### Tweaking services

ApisCP includes a variety of services that can be enabled for an account. Some services must be enabled whereas others can be optionally enabled. Let's create an account that allows up to 2 additional users, disables MySQL, disables email, disables shell access, and disables addon domains. A single-user domain with limited access that may only upload files.

```bash
AddDomain -c siteinfo,domain=securedomain.com -c siteinfo,admin_user=secureuser -c users,enabled=0 -c users,max=3 -c mysql,enabled=0 -c mail,enabled=0 -c ssh,enabled=0 -c aliases,enabled=0
```

### Flags

**--plan|-p=name**: apply named plan to account  
**--force**: hook failure does not constitute addition failure  

### API usage

`admin:add-site(string $domain, string $admin, array $opts = [], array $flags = [])` is the backend API [call](https://api.apiscp.com/class-Admin_Module.html#_add_site) for this command-line utility. $admin corresponds to siteinfo,admin_user and must be unique.

## EditDomain

`EditDomain` is a helper to change account state without removing it. You can toggle services and make changes in-place in a non-destructive manner. From the above example, it's easier to change the email address without destroying the account.

```bash
EditDomain -c siteinfo,email=hello@apisnetworks.com -D mydomain.com
```

### Rename domain

A simple, common situation is to alter the primary domain of an account. Simply changing the domain attribute under the *siteinfo* service will accomplish this.

```bash
EditDomain -c siteinfo,domain=newdomain.com mydomain.com
```

### Changing password

Changing the password is another common operation:

```bash
EditDomain -c auth,tpasswd=newpasswd site12
```

::: details
A new password is set in plain-text, "newpasswd". The third password alternative is cpasswd, which is a [crypt()](http://man7.org/linux/man-pages/man3/crypt.3.html)'d password. An optimal crypted password may be generated with [auth_crypt](https://api.apiscp.com/class-Auth_Module.html#_crypt). Alternatively, `cpcmd auth_crypt newpasswd` may be used to create the crypted password or To note, EditDomain accepts either the primary domain of an account, an aliased domain of an account (addon domain), or the site identifier. Aliases are discussed next.
:::

### Aliases

Aliases are domains for which the primary responds. Any alias also serves as a valid authentication mechanism in the *user*@*domain* [login mechanism](../INSTALL.md#logging-into-services). Any alias without a defined document root will serve content from /var/www/html, which is the [document root](https://kb.apiscp.com/web-content/where-is-site-content-served-from/) for the primary domain.

```bash
EditDomain -c aliases,aliases=['foobar.com'] mydomain.com
```

::: danger
aliases,aliases is dangerous! It is not an append-only operation, meaning that whatever aliases value is is what is attached, nothing more and nothing less. A safer option is `aliases_add_domain`, `aliases_remove_domain` part of the API, which adds or removes domains in a singular process. This is part of `cpcmd` discussed later on.
:::

### Dry-runs

A dry-run proposes changes without applying them.

```bash
EditDomain --dry-run -c siteinfo,domain=newdomain.com site1
# site1:
#   siteinfo: { domain: newdomain.com }
#   apache: { webserver: www.newdomain.com }
#   ftp: { ftpserver: ftp.newdomain.com }
```

In the above example, changing *siteinfo*,*domain* implicitly renames that service field as well as *apache*,*webserver* and *ftp*,*ftpserver*.

### Mass edits

Two options complement EditDomain, `--all` and `--reconfig`.

`--all` targets all domains on a server. `--reconfig` applies service reconfiguration to all services that support the feature. It may be used to forcefully regenerate configuration after overriding configuration (see [Customizing.md](Customizing.md)).

```bash
EditDomain --all
EditDomain --reconfig
# or do both!
EditDomain --all --reconfig
```

#### Targeting specific accounts

`admin:collect(?array $params = [], array $query = null, array $sites = []): array` is an API command to collect service values from matching accounts. This can be mixed with JSON formatting + jq to perform complex scripting without clunky parsing. For example, to fetch all sites that have the plan "basic" and reconfigure to "advanced":

```bash
# Install jq first
yum install -y jq
cpcmd -o json admin:collect '[]' '[siteinfo.plan:basic]' | jq -r 'keys[]' | while read -r SITE ; do
 echo "Editing $SITE"
 EditDomain -c siteinfo,plan="advanced" "$SITE"
done
```

### Resetting account

A reset is specified with `--reset`. Depending upon context-specific options, a reset will either apply the unchanged differences between plans or reset an account to default plan settings.

When `--plan=NEWPLAN --reset` is specified, only *unchanged defaults* are applied.

When `--reset` exists without a plan specifier, then the default plan settings are applied. A plan setting is only applied if the new plan's default value is not an array or not null. Certain parameters distinct to accounts, such as paswords, addon domains, and invoice are never reset.

### Changing plans

Plans are covered later in this section. Note the behavior when changing plans is that *only* the unchanged differences are applied. To reset all unprotected service variables to their new plan value, use `--reset` in conjunction with `--plan` as noted above.

### Flags

**--plan|-p=name**: apply named plan to account. Same as setting -c siteinfo,plan=NAME.  
**--force**: hook failure does not constitute addition failure.  
**--reset**: reset service parameters. Context-specific, see above note on reset!  
**--dry-run**: show proposed changes without applying them.  
**--backup**: create a backup of the metadata prior to editing. This metadata is stored in siteXX/info/backup. Each successive run overwrites this data.  

#### Listing services

`AddDomain -h` will list all available services. These services map to resources/templates/plans/.skeleton/, which infer support data from lib/Opcenter/Service/Validators/*Service Name*/*Service Var*/.php.

### API access

`admin:edit_site(string $site, array $opts = [], array $flags = []): bool` allows editing of sites. See [API.md](API.md) for implementing API access.

## DeleteDomain

Domains may be deleted using `DeleteDomain`. DeleteDomain accepts a list of arguments that may be either the site identifier, domain, aliased domain, or invoice (billing,invoice OR billing,parent_invoice service value). Invoices allow you to quickly group multiple accounts. Invoices are discussed briefly below.

### Flags

**--since=TIMESPEC**: only delete domains suspended TIMESPEC ago ("last week", "now", 1579934058).  
**--force**: delete a domain in a partial edit state.  
**--dry-run**: show what will be deleted without deleting.  

### API access

`admin:delete-site(?string $site, array $flags = []): bool` allows deletion of sites. See [API.md](API.md) for implementing API access.

Passing null to $site and [since:timespec] to $flags allows deletion of suspended sites suspended timespec ago. Specify a timespec of "now" to delete all suspended sites. For example to show what sites would be deleted from the shell,

`cpcmd admin:delete-site null '[since:now,dry-run:true]'`

## SuspendDomain

Domains may be deactivated from the command-line using `SuspendDomain`. It accepts a list of arguments, which may be the site identifier, domain, aliased domain, or [billing invoice](Billing%20integration.md).

::: tip
A suspended domain revokes access to all services, except panel, as well as page access. Panel access may be overridden by setting *[auth]* => *suspended_login* to true in [config.ini](Tuneables.md).
:::

When a billing invoice is specified any site that possesses this identifier either as billing,invoice or billing,parent_invoice will be suspended.

### API access

`admin:deactivate-site(string $site): bool` allows suspension of sites. See [API.md](API.md) for implementing API access. $site may be any site identifier or billing invoice.

## ActivateDomain

Likewise a domain may be activated by using `ActivateDomain`. It acts similarly to SuspendDomain except that it undoes what SuspendDomain does.

```bash
ActivateDomain apiscp-XYZ123
```

Where *apiscp-XYZ123* is a billing invoice assigned to the account via `-c billing,invoice=apiscp-XYX123`

### API access

`admin:activate-site(string $site): bool` allows reactivation of suspended sites. See [API.md](API.md) for implementing API access. $site may be any site identifier or billing invoice.

# Plans

Plans are related to AddDomain and EditDomain in that they assign preset settings to a domain.

## Creating plans

New plans may be created using artisan.

```bash
cd /usr/local/apnscp
./artisan opcenter:plan --new custom
```

The plan is created within resources/templates/plans/custom. Changes may be made at your leisure. Use `./artisan opcenter:plan --verify PLAN` to confirm the plan named *PLAN*.

A plan may copy another plan's definitions by specifying `--base OLDPLAN`. For example,

```bash
./artisan opcenter:plan --new nossh --base custom
```

Plans may be created thinly in which services from the **default plan** are inherited unless explicitly named. This allows simplification such as the following "ssh" service definition which disables just SSH access, inheriting all other plan defaults.

Consider the service "nossh", which has 1 file in resources/templates/plans/nossh named ssh with the following line:

```ini
[DEFAULT]
enabled = 0
```

This is a valid plan definition and will inherit all other plan values from the default plan.

Additionally, the familiar `-c` flag may be used to feed individual overrides to a plan,

```bash
./artisan opcenter:plan --new nossh -c ssh,enabled=0
```

## Managing plans

The following commands imply `./artisan opcenter:plan` is used.

`PLAN --default`: set the default plan, e.g. to set the default plan for accounts going forward, use `./artisan opcenter:plan --default custom`. Note this is equivalent to using the cp.config [Scope](Scopes.md) to change *[opcenter]* => *default_plan*.

`PLAN --diff=COMPARE`: compare PLAN against COMPARE returning only the differences in PLAN that do not exist in COMPARE or are different.

`PLAN --remove`: remove named PLAN.

`PLAN --verify`: run internal verification against PLAN ensuring it can publish an account.

`--list`: list all plans.

## Assigning plans

These plans can be customized and assigned to an account using -p, `AddDomain -p custom -c siteinfo,domain=mydomain.com`. Likewise to assign a new plan to all accounts, `EditDomain -c siteinfo,plan=advanced --all` would apply the plan named "advanced" to all accounts. This is a destructive operation and instead encourage a simpler route of filtering accounts, then applying plans individually.

```bash
# Install jq first
yum install -y jq
cpcmd -o json admin:collect '[]' '[siteinfo.plan:basic]' | jq -r 'keys[]' | while read -r SITE ; do
 echo "Editing $SITE"
 EditDomain -c siteinfo,plan="advanced" "$SITE"
done
```

A plan applied to an account does not reset any service values changed beyond the plan base. For example, if ssh,enabled=1 were the setting on an account and SSH were deactivated by setting ssh,enabled=0 outside the plan settings, then changing to a new plan in which ssh,enabled=1 exists *would not* apply to the site.

This behavior may be altered by supplying `--reset` to EditDomain. See [EditDomain](#EditDomain) above for more information.


## Complex plan usage

OverlayFS, part of [BoxFS](Filesystem.md), may be used to create complex plans that add additional services.

A cPanelesque feature allows users to use cron while disabling ssh. Doing so still allows the user arbitrary access to SSH into the server by opening a tunnel within a cron task, so the only means to ensure an environment without shell access is to disable all ingress routes. Despite this advice, cron may be enabled while disabling terminal access with a new service layer that utilizes the whiteout feature of OverlayFS:

```bash
mkdir -p /home/virtual/FILESYSTEMTEMPLATE/nossh/etc/pam.d
mknod /home/virtual/FILESYSTEMTEMPLATE/nossh/etc/pam.d/sshd c 0 0
touch /home/virtual/site1/info/services/nossh
/etc/systemd/user/fsmount.init mount site1 nossh
```

::: details
Use OverlayFS' whiteout feature to mask the sshd pam service, so you'd have all the affordances of the ssh service layer/bins but without the ability to authenticate via SSH. Layers are left-to-right precedence and layers are mounted lexicographically. To have a service supercede "nossh" name it lower in the alphabet such as "negatednossh".
:::

Any character device with major:minor 0:0 is hidden on upper layers. This a feature consistent with layered filesystems, OverlayFS and aufs notably. ApisCP uses OverlayFS presently but used aufs prior to [2016](http://updates.hostineer.com/2016/01/luna-launched-open-beta/). A corresponding [surrogate](../PROGRAMMING.md#extending-modules-with-surrogates) is created to mount the layer if the package name matches a package which lacks ssh but permits cron:

```php
<?php declare(strict_types=1);

    class Ssh_Module_Surrogate extends Ssh_Module
    {
        const SSHLESS_PLANS = ['basic'];
        public function _create()
        {
            parent::_create();
            $plan = $this->getServiceValue('siteinfo', 'plan', \Opcenter\Service\Plans::default());
            if (!\in_array($plan, static::SSHLESS_PLANS, true)) {
                return;
            }

            return $this->maskSsh();
        }

        public function _edit()
        {
            parent::_edit();
            $newPlan = array_get($this->getNewServices('siteinfo'), 'plan', \Opcenter\Service\Plans::default());
            $oldPlan = array_get($this->getOldServices('siteinfo'), 'plan', \Opcenter\Service\Plans::default());
            if (\in_array($oldPlan, static::SSHLESS_PLANS, true) === ($post = \in_array($newPlan, static::SSHLESS_PLANS, true))) {
                return;
            }
            return $post ? $this->maskSsh() : $this->unmaskSsh();
        }

        private function maskSsh(): bool {
            $layer = new \Opcenter\Service\ServiceLayer($this->site);
            if (!$layer->installServiceLayer('nossh') || !$layer->reload()) {
                return error("Failed to mount `nossh' service");
            }
            return true;
        }

        private function unmaskSsh(): bool
        {
            $layer = new \Opcenter\Service\ServiceLayer($this->site);
            if (!$layer->uninstallServiceLayer('nossh') || !$layer->reload()) {
                return error("Failed to unmount `nossh' service");
            }

            return true;
        }
    }
```

Make sure the plan listed above in `SSHLESS_PLANS` exists (see [artisan opcenter:plan](../PROGRAMMING.md#creating-service-definitions)) and you're off to the races!

You may confirm the service layer has been mounted via mount in procfs:

```bash
EditDomain -p basic site12
grep 'site12/fst' /proc/mounts | grep lowerdir=
# You should see "nossh" in the composite layer
# Additionally, confirm the layer marker has been installed
ls /home/virtual/site12/info/services/nossh
```
