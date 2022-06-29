# WordPress

::: tip
Part of the Web Apps family, WordPress supports many familiar components shared by all other apps. See [WebApps.md](../WebApps.md) for preliminary information that covers the *update process*.
:::

## WP-CLI Toolkit
[WP-CLI](https://wp-cli.org) is the official command-line utility for managing WordPress. It's available on all accounts and powers WordPress features in the panel.

### Using from terminal
WP-CLI is located as `wp-cli` from terminal. It may be aliased to `wp` by adding `alias wp=wp-cli` to `~/.bashrc`:

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

### Debugging updates

::: tip
See [WebApps.md](../WebApps.md) for general debugging information that applies to all Web Apps.
:::

In addition to general debugging, when DEBUG=1, WP-CLI will emit additional debugging information through the `--debug` flag.

For example, let's say we want to debug a failed update for a plugin named *bad-plugin* to version *bad-version*. This can be replicated from command-line with additional debugging information available as follows:

```bash
env DEBUG=1 cpcmd -d domain.com wordpress:update-plugins domain.com '' '[[name:bad-plugin,version:bad-version]]'
```

WP-CLI may output something like,

```
Warning: The update cannot be installed because we will be unable to copy some files. This is usually due to inconsistent file permissions. "changelog.txt, astra-addon.php, includes, includes/view-white-label.php, includes/index.php, credits.txt, compatibility, compatibility/class-astra-ubermenu-pro.php, compatibility/class-astra-wpml-compatibility.php, languages, languages/astra-addon-fr_FR.mo, languages/astra-addon-nb_NO.mo, languages/astra-addon-nl_NL.mo, languages/astra-addon-ru_RU.mo, languages/astra-addon-fi.mo, languages/astra-addon-pl_PL.mo, languages/astra-addon-he_IL.mo, languages/astra-addon-pt_BR.mo, languages/astra-addon-uk.mo, languages/astra-addon-it_IT.mo, languages/astra-addon-sk_SK.mo, languages/astra-addon-hu_HU.mo, languages/astra-addon-ja.mo, languages/astra-addon-sv_SE.mo, languages/astra-addon-bg_BG.mo, languages/astra-addon-de_DE.mo, languages/astra-addon-es_ES.po, languages/astra-addon-ar.mo, languages/astra-addon-fa_IR.mo, languages/astra-addon-da_DK.mo, languages/astra-addon-es_ES.mo,
```

The above, for example, is caused by a permission mismatch and can be resolved by resetting permissions and reapplying [Fortification](../Fortification.md) in ApisCP or from command-line:

```bash
cpcmd -d domain.com file:reset-path /path/to/wp ''
cpcmd -d domain.com wordpress:fortify domain.com '' max
```

::: tip
Arguments differ due to module intent. Modules of the "webapp" family prefer *\$hostname*, *\$path* as opposed to a raw filesystem path as domains/subdomains can be relinked relatively easily. Doing so allows the API calls to remain stable even if the document root is not.
:::

## Fortification enhancements
**New in 3.2.0:**

WordPress' FTP driver is used to grant write-access to system files. In certain scenarios, a plugin or theme may be unaware of how to use WordPress' VFS library to interact with a site. Setting [Fortification](../Fortification.md) modes to **Disable Fortification**, **Web App Write Mode**, or **Learning Mode** will set `FS_METHOD` in *wp-config.php* to `'direct'`. Enabling any other Fortification mode or resetting permissions will reset `FS_METHOD` to `false`, which selects the appropriate VFS driver (FTP) based on write-access to *wp-includes/file.php*. Without altering permissions outside of the control panel, this test will always fail thus requiring FTP to manage files.

## Programmatic wp-config.php
**New in 3.2.0:**

`define()` statements make up the core of WP [configuration](https://wordpress.org/support/article/editing-wp-config-php/). 3.2 bundles a powerful AST parser that can read any valid WordPress configuration, look for define() statements, and update its corresponding configuration.

For example, what if we're importing a WP install from another platform that doesn't use Fortification? The following [hook](../Hooks.md) would set `FTP_USER`, `FS_METHOD`, and `FTP_HOST` for all existing installations whenever `wordpress:valid()` is called:

```php
<?php
        \a23r::registerCallback('wordpress', 'valid', function ($ret, $args) {
        if (!$ret) {
            return;
        }

        $approot = $args[0];

        if ($approot[0] !== '/') {
            // passed as $hostname, $path
            $approot = $this->getAppRoot($args[0], $args[1] ?? '');
        }

        $pairs = [
            'FS_METHOD'           => false,
            'FTP_USER'            => $this->username . '@' . $this->domain,
            'FTP_HOST'            => 'localhost'
        ];

        return $this->updateConfiguration($approot, $pairs);
    });
```
`wordpress:valid()` is triggered during plugin/theme enumeration as part of periodic updates. Running a manual update would update all valid WordPress installs with the new configuration:

```bash
cpcmd admin:update-webapps '[type:wordpress,assets:true]'
```

## Mass WP-CLI usage
**New in 3.2.33**

`wordpress:cli()` applies a WP-CLI command against all or one registered WordPress sites on an account.

`wordpress:cli(string $command, string|array $args = [], string $hostname = null, string $path = ''): array`

When `$hostname` and `$path` are omitted the command is applied against all sites. `$args` may be formatted using positional markers (`%s`, `%(domain)s`, `%d`, `%1s`).

```bash
# Remove dolly from all WordPress sites
cpcmd -d example.com wordpress:cli 'plugin uninstall %s' '[dolly]'
# Verify core checksums against WordPress app installed under example.com/wp
cpcmd -d example.com wordpress:cli 'core verify-checksums' '' 'example.com' 'wp'
# Return all plugins formatted in JSON for each site
cpcmd -d example.com wordpress:cli '--json plugin list'
```

When applied against all sites the results are keyed by the filesystem path. Each element contains *hostname* and *path* values to resolve the site from its path.

```bash
cpcmd -d mechanical.com wordpress:cli '--json plugin list'
# /var/www/html:
#   hostname: mechanical.com
#   path: ''
#   stdin: ''
#   stdout: '[{"name":"akismet","status":"inactive","update":"available","version":"4.2.3"},{"name":"hello","status":"inactive","update":"none","version":"1.7.2"}]'
#   stderr: ''
#   output: '[{"name":"akismet","status":"inactive","update":"available","version":"4.2.3"},{"name":"hello","status":"inactive","update":"none","version":"1.7.2"}]'
#   errno: 0
#   return: 0
#   error: ''
#   success: true
```

