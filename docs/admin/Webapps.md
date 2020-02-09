# Web Apps

## Installing

Web apps may be installed via **Web** > **Web Apps** within the panel. All web apps, with the exception of Joomla! and Magento, support unassisted updates. These updates run every Wednesday and Sunday during regular maintenance windows. Maintenance windows can be changed by altering the system timezone, `cpcmd scope:set system.timezone` as well as the [anacron](https://linux.die.net/man/8/anacron) window, `cron.start-range`, provide a calibration window for nightly tasks.

## Permissions

Web apps install under a separate system user with the least amount of permissions necessary. Permissions are discussed in detail in Audit.md and Fortification.md.

## Detection

All apps installed via **Web** > **Web Apps** are enrolled into apnscp's automatic update facility unless disenrolled via **Web Apps** "enable auto-updates" option. Enrollment information is preserved as well when an account migrates from one apnscp platform to another. 

A site migrated over from a non-apnscp platform or installed manually may be detected and enrolled automatically using `admin_locate_webapps`.
> ```bash
> # cmd admin_locate_webapps '[site:mydomain.com]'
> INFO    : Searching on `site49' (mydomain.com)
> INFO    : Searching docroot `/var/www/html' (mydomain.com) for webapps
> INFO    : Detected `wordpress' under `/var/www/html'
> ----------------------------------------
> MESSAGE SUMMARY
> Reporter level: OK
> ----------------------------------------
> Array
> (
>     [/var/www/html] => wordpress
> )
> ```

## Updates
Updates process automatically every night. A batch update can be processed immediately with `admin_update_webapps`.

>```bash
># cmd admin_update_webapps '[site:mydomain.com]'
>INFO    : ℹ️ site49 batch: new upgrade task - mydomain.com (wordpress) 3.9.1 -> 5.1
>----------------------------------------
>MESSAGE SUMMARY
>Reporter level: OK
>----------------------------------------
>INFO    : ✅ Upgrading mydomain.com, wordpress - 3.9.1 -> 5.1
>```

All web apps dispatch an upon completion informing success or failure,

> | ✅ mydomain.com | Wordpress | 4.0    | 4.0.25 |
> | -------------- | --------- | ------ | ------ |
> | ✅ mydomain.com | Wordpress | 4.0.25 | 4.1.25 |
> | ✅ mydomain.com | Wordpress | 4.1.25 | 4.2.22 |

apnscp will upgrade incrementally to the last patch of each minor if supported by the module. This provides maximum success and in the event of failure, better odds of failing on a higher version upgrade rather than lower.

### Setting version limits

Updates can be controlled to limit the maximal version of an upgrade. To do so,

* **Web** > **Web Apps** > *Select app* 
* Under Options, **Update version Lock**
    * "None" process all updates
        * ✅ 5.0.1 -> 5.0.19
        * ✅ 5.0.1 -> 5.1.0
        * ✅ 5.0.1 -> 6.0.0
    * "Major" process all updates up to the major version
        * ✅ 5.0.1 -> 5.0.19
        * ✅ 5.0.1 -> 5.1.0
        * ❌ 5.0.1 -> 6.0.0
    * "Minor" process all updates to the minor version
        * ✅ 5.0.1 -> 5.0.19
        * ❌5.0.1 -> 5.1.0
        * ❌5.0.1 -> 6.0.0
    * Version lock is honored by themes/plugins as well

### Failures

apnscp will not retry a web app that has previously failed. An email will be dispatched informing the user a failure has occurred. If [crm] => `copy_admin` is set, then a copy of this failure will be sent to the named admin.

>| ❌ my.bad.site                                                | Wordpress | 3.4.2 | 3.8.28 |
>| ------------------------------------------------------------ | --------- | ----- | ------ |
>| **ERROR:**  Wordpress_Module::theme_status: failed to get theme status: Error:  WP-CLI needs WordPress 3.7 or later to work properly. The version  currently installed is 3.4.2. Try running `wp core download --force`. |           |       |        |
>| **ERROR:** Wordpress_Module::update_all: failed to update all components |           |       |        |

Web apps that have failed will not be retried unless cleared by the appliance administrator, site administrator, or upon successful update.

`admin_list_failed_webapps` provides a list of all web apps that have failed.

`admin_reset_webapp_failure` will reset all failures across all domains. Filter with `site` or `type` to restrict reset to a site or app type, e.g.

> ```bash
> # cpcmd admin_reset_webapp_failure '[type:ghost]'
> ----------------------------------------
> MESSAGE SUMMARY
> Reporter level: OK
> ----------------------------------------
> INFO: Reset failed status on `hq.apiscp.com/'
> 1
> ```

Alternatively a web app may be reset within the control panel,

* **Web** > **Web Apps** > *Select dropdown* > **Reset Failed**

Resetting failed will attempt another update during nightly updates. A web app may be updated immediately by select **Update** under <u>App Meta</u>.