# WordPress

[WP-CLI](https://wp-cli.org) is the official command-line utility for managing WordPress. It's available on all accounts and powers WordPress features in the panel.

## Using from terminal
WP-CLI is located as `wp-cli` from terminal. It may be aliased to `wp` by adding `alias wp=wp-cli` to ~/.bashrc:

```bash
echo -e "\nalias wp=wp-cli" >> ~/.bashrc
exec $SHELL -i
```

`wp-cli` is path-sensitive. Run `wp-cli` within the directory that contains a WordPress install or pass `--path=/PATH/TO/WP/INSTANCE`. Additionally, ApisCP supports su into secondary users by the primary user if a WordPress site is managed by a secondary user.

```bash
cd /var/www/html
wp-cli core version
# Reports: 5.4
wp-cli option list
# List all options in wp_option table
wp-cli option set blogdescription "Just another WordPress site"

# Won't work!
cd /home/brad
su brad
# Now brad
cd /home/brad/public_html
wp-cli core version
```

## Update process
Core updates are checked every night. Packages are checked every Wednesday and Sunday night as defined by `cron.start-range` [Scope](../Scopes.md) and consistent with all [Web Apps](../Webapps.md). All non-suspended sites are checked for updates. *A core update triggers asset updates before the core update is applied.* 

Failure during a core update marks a WordPress installed as **failed**. **Failures will not be retried**. To reset a failure, login to ApisCP as the user, then navigate to **Web** > **Web Apps**, selecting the hostname (and optional path) to reset failure or as admin use `admin:reset-webapp-failure()`.

`admin:reset-webapp-failure(array $constraints = [])` where `$constraints` is of the conjunctive set of the following parameters: `[site: <anything>, version: <operator> <version>, type: <type>]`.  For example, to reset only apps belonging to debug.com or reset all failures for WordPress > 4.0, use the following commands:

```bash
cpcmd admin:reset-webapp-failure '[site:debug.com]'
cpcmd admin:reset-webapp-failure '[version:"> 4.0", type:wordpress]'
```

::: tip
When working with the version parameter, spacing is significant between the operator and version.
:::

Updates work in batches adhering to the following rules:

1. Update to the largest **patch** release of current [MAJOR.MINOR](https://semver.org/) release.
2. Increment **minor** release by the smallest increment.
3. Repeat steps 1-2 until **minor** is at maximal version.
4. Increment **major** release by the smallest increment.
5. Repeat steps 3-4 until software is current.

If at any time an update fails, the Web App will left at this version. Moving incrementally with updates ensures that maximum compatibility is taken into account with older software thus achieving the highest success rate in updates.

![Web Apps update strategy](./images/webapps-update-strategy.png)

### Debugging package updates

Update reports are sent to the email associated with the account. If *[crm] => copy_admin* is also set in [config.ini](../Tuneables.md), then a report is sent to this address as well. 

