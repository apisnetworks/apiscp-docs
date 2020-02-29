---
title: Helpers
---
ApisCP provides a variety of command-line helpers that allow you to interact with your accounts. For example, you may want to put the panel in [headless mode](https://github.com/apisnetworks/apnscp-playbooks#toggling-headless-mode), which disables web-based access, automate account management, or even too run a command as another site.

All helpers live under `/usr/local/apnscp/bin`. All commands except for `cpcmd` must be run as root. `sudo su -` is a quick way to become root if you aren't already.

> *Domain binaries: AddDomain, EditDomain, DeleteDomain, ActivateDomain, and SuspendDomain are covered in [Plans.md](Plans.md). ImportDomain and ExportDomain are covered in [Migrations.md](Migrations.md). This document covers other helpers.

## cpcmd

cpcmd is the single most important command in your arsenal. As root, it allows you to run a command within any authentication context – any. Need to add a domain to *mysite.com* named *blog-site.com*?

```bash
cpcmd -d mysite.com aliases_add_domain blog-site.com /var/www/blog-site.com
cpcmd -d mysite.com aliases_synchronize_changes
```

> Easy, huh? This adds a new domain named blog-site.com with the document root */var/www/blog-site.com*, then updates the web server configuration. Alternatively, `aliases_remove_domain blog-site.com` would remove the domain from the account.

Now let's configure Let's Encrypt for the addon domain and install Wordpress.

```bash
cpcmd -d mysite.com letsencrypt_append blog-site.com
cpcmd -d mysite.com wordpress_install blog-site.com
```

And that's it!

What about removing a vacation auto-responder for a secondary user named sam?

```bash
cpcmd -d mysite.com -u sam email_remove_vacation
```

That's it!

Let's collect a web app inventory as the server admin of a new site, mydomain.com, then update them as necessary:

```bash
cpcmd admin_locate_webapps 'mydomain.com'
cpcmd admin_update_webapps '[site:mydomain.com]'
```

Any command in the panel has a corresponding [API](https://api.apiscp.com/) method. Quite simply, whatever you can do in the panel you can do too from the command-line or afar with [Beacon](https://github.com/apisnetworks/beacon).

### Alternate invocation

Commands may also be written in a clear form separating the module from the function by a colon and replacing function underscores ("_") with hypens ("-"). The above admin command thus becomes:

```bash
cpcmd admin:locate-webapps 'mydomain.com'
```

### Listing all commands

`misc:list-commands(string $filter = '')` lists commands available to the current role. "filter" is any glob-style patern. For example, to see all admin commands available to the admin:

```bash
misc:list-commands "admin:*"
```

To see all commands containing "pass" for the Site Administrator of site1,

```bash
misc:list-commands "*pass*"
```

`misc:l` is shorthand for this usage.

### Introspecting commands

`misc:info(string $filter = '')` displays command information including its signature, documentation, return type, and parameter documentation. It behaves similarly to `misc:list-commands`.

`misc:i` is shorthand for this usage.

### Arbitrary execution/interactive mode
`cpcmd -r` creates an execution context after ApisCP has been loaded. It may be used to interact with panel state as a one-liner.

```bash
# Load Laravel configuration, get contents from config/laravel/mail.php
cpcmd -r '$app = app("config"); var_dump($app["mail"]);'
```

`cpcmd --interactive` is similar to one-liner mode (-r), but launches an interactive shell. State is not maintained in between invocations.

```bash
cpcmd --interactive
# now in shell
var_dump(app('config')['mail']);
echo $c->commom_whoami(), "\n";
$i = 0;
# This will not work...
echo ++$i;
```

### get_site

Get site name from domain. Same as "site" + `get_site_id` 

### get_site_id

Get internal site ID from domain. Returns 1 on failure otherwise 0.

#### Example

```bash
get_site_id example.com
[[ $? -ne 0 ]] && echo "example.com doesn't exist"
```
### fstresolve

Determine libraries linked against a binary. Used to resolve dependency problems when propagating a system package into the filesystem template.

#### Example

```bash
fstresolve /home/virtual/FILESYSTEMTEMPLATE/siteinfo/usr/bin/ar
```

## Scripts
All ApisCP scripts are available under `{{ $themeConfig.APNSCP_ROOT }}/bin/php/scripts`. All scripts make use of the apnscp CLI framework and require invocation with `apnscp_php` to operate.

### change_dns.php

Bulk change DNS for an account.

### changelogparser.php

Summarize apnscp changes.

### reissueAllCertificates.php

Perform a bulk reissue of all certificates. See [SSL.md](SSL.md) for further information.

### transfersite.php

Migrate an ApisCP site between servers. See [Migrations](Migrations - server.md) for further information.

### yum-post.php

Synchronize a system back into FST.

## Build scripts

### build/php/php.config

Build PHP for apnscp. To run, change into PHP source directory, then run:

`{{ $themeConfig.APNSCP_ROOT }}/build/php/php.config`

PHP will be built with apnscp module requirements.

### build/httpd/apxs
General utility apxs wrapper to build modules specifically for apnscp. Installed modules will be placed under `sys/httpd/private/modules`. Unless the module conflicts with global Apache instance, modules can be used from `sys/httpd/modules`, which is a symlink to `/usr/lib64/httpd/modules`.


