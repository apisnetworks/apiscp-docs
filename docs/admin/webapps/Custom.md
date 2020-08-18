# Third-party applications

Third-party applications may be deployed under `config/custom/webapps/<name>`. A demo app is available via [apiscp-webapp-demo](https://github.com/apisnetworks/apiscp-webapp-demo) on GitHub.

::: danger Web Apps have root
All Web Apps have the potential to execute arbitrary code as root either by adding new root-level API calls or by hooking into housekeeping. Only install Web Apps from trusted third-parties.
:::

Any name may be used for the module and handler. Let's clone the repository, then update autoloader via `dumpautoload -o` so ApisCP knows where to look for the new files.

```bash
cd /usr/local/apnscp
git clone https://github.com/apisnetworks/apiscp-webapp-demo config/custom/webapps/demo
# Rebuild classmaps, including all files under config/custom/
./composer dumpautoload -o
```

Next, tell ApisCP to load a new module called "demo2" and new Web App called "demo" in `config/custom/boot.php`. Create the file if it does not yet exist. This is used for adding additional features early in the request lifecycle.

```php
<?php
    
\a23r::registerModule('demo2', \apisnetworks\demo\Demo_Module::class);
\Module\Support\Webapps::registerApplication('demo', \apisnetworks\demo\Demo::class);
```

Looking at the directory layout, `views/` and `lib/` are the only required components. views contain all [Blade templates](PROGRAMMING.md#laravel-integration), including optional email templates. All files are optional, but encouraged to give an application personalization.

```
demo
|- views: Blade views
|  |- actions.blade.php
|  |- extras.blade.php
|  |- icon.blade.php
|  |- icon-sm.blade.php
|  |- job-installed.blade.php
|  `- options-install.blade.php
|
`- lib: PHP library code,
   |- module.php PHP module
   `- handler.php PHP type handler

```

::: tip
Only native app templates may be overridden by creating the same structure in `config/custom/webapps/views/`
:::

