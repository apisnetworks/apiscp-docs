---
title: Programming guide
---

# Basics

ApisCP is designed to be flexible and fast. Because ApisCP cannot exist without a broker (apnscpd) to transfer critical unprivileged code to privileged backend tasks, a critical choke also exists between this transfer (`$this->query('method', $args)`). Backend methods are designed to be thin. Make your frontend however you want, but inversely proportion complexity to backend calls as they bear the brunt of the logic and each backend roundtrip costs 0.1 ms when session resumption can be used. Without resumption each request is 6x slower.

## Invocation flow

ApisCP is partitioned into 2 components: an unprivileged frontend (typically runs as user "nobody") and a privileged backend that runs as root. Methods can traverse to the backend using a special method, `query(method, arg1, arg2, argn...)`, part of `Module_Skeleton`.

`query()` bundles the parcel along with session identifier.

```php
public function test_frontend() {
    if (!IS_CLI) {
        return $this->query("test_backend", "test");
    }
    return "Hello from frontend!";
}

public function test_backend($arg1) {
    return "Hello from backend! Got ${arg1}";
}
```

Backend calls are wrapped into an `apnscpObject` transported over a `DataStream` connection. `Module_Skeleton::query()` automatically instantiates a suitable `apnscpObject` query for use with `DataStream`. In special cases, this can be mocked up manually.

```php
public function queryMulti() {
    /**
     * Send multiple backend commands at once, order guaranteed,
     * and store results
     */
    $ds = \DataStream::get();
    $keys = ['siteinfo', 'mysql', 'pgsql'];
    list ($cur, $new, $old) = $ds->multi("common_get_services", $keys)->
        multi("common_get_new_services", $keys)->
        multi("common_get_old_services", $keys)->send();

}
```

### "No Wait" flag

`apnscpObject::NO_WAIT` will send a command to backend without waiting on a response. This can be useful in situations in which data must be sent to backend, but status is immaterial. Alternatively, *NO_WAIT* can be used to return immediately provided the backend confers status by another process. An example would be exiting a 1-click install immediately and sending the response via email.

```php
class Someapp_Module extends Module_Skeleton {
  public function install(): ?void {
      if (!IS_CLI) {
          $ds = \DataStream::get();
          $ds->setOption(\apnscpObject::NO_WAIT);
          // NO_WAIT implies null return
          return $ds->query('someapp_install');
      }
      /**
       * Do something in the backend
       * suggested to email user
       */
      \Mail::send('user@domain', 'App Installed', 'OMG it works!');
  }
}
```

## Error handling

### Warning on exception usage

Exceptions convey stack. Stack conveyance adds overhead. Do not throw exceptions in Module code, especially in file_* operations. Do not throw exceptions in any critical part of code that will not immediately terminate flow. In fact, **exception usage is discouraged unless it explicitly results in termination** (in which case, `fatal()` works better) **or a deeply nested call needs to return immediately**.

### Non-exception usage

ApisCP bundles a general-purpose [error library](https://github.com/apisnetworks/error-reporter) with a variety of macros to simplify life. `fatal()`, `error()`, `warn()`, `info()`, `success()`, `deprecated()`, and `debug()` log issues to the error ring. error(), warn(), info() will copy stack if in **[core]** -> **debug** is set in config.ini (see [Configuration](#Configuration)). **[core]** -> **bug_report** will send a copy of production errors to the listed address.

```php
public function test_value($x) {
    if (is_int($x)) {
        return success('OK!');
    }
    if (is_string($x)) {
        return warn('I guess that is OK!') || true;
    }
    return error("Bad value! `%s'", $x);
}
```

ER supports argument references as well utilizing [sprintf](http://php.net/manual/en/function.sprintf.php).

```php
public function test_command($command, $args = []) {
    $status = Util_Process::exec($command, $args);
    if (!$status['success']) {
        /**
         * $status returns an array with: success, stderr, stdout, return
         */
        return error("Failed to execute command. Code %d. Output: %s. Stderr: %s", $status['return'], $status['stdout'], $status['stderr']);
    }
}
```

### Registering message callbacks

Register callbacks to `add_message_callback()`. For example, to dump stack on fatal errors on DAV during development (or AJAX) where unexpected output breaks protocol formatting:

```php
Error_Reporter::set_verbose(0);
Error_Reporter::add_message_callback(Error_Reporter::E_FATAL, new class implements Error_Reporter\MessageCallbackInterface {
    public function display(
        int $errno,
        string $errstr,
        ?string $errfile,
        ?int $errline,
        ?string $errcontext,
        array $bt
    ) {
        dd($bt);
    }
});
```

### ER message buffer macros

The following macros are short-hand to log messages during application execution.

| Macro             | Purpose                                                      | Return Value |
| ----------------- | ------------------------------------------------------------ | ------------ |
| fatal()           | Halt script execution, report message.                       | null         |
| error()           | Routine encountered error and should return from routine. Recommended to always return. | false        |
| warn()            | Routine encountered recoverable error.                       | true         |
| info()            | Additional information pertaining to routine.                | true         |
| success()         | Action completed successfully.                               | true         |
| debug()           | Message that only emits when DEBUG set to 1 in config.ini    | true         |
| deprecated()      | Routine is deprecated. Callee included in message.           | true         |
| deprecated_func() | Same as deprecated(), but include callee's caller            | true         |
| report()          | Send message with stack trace to **[core]** -> **bug_report** | bool         |

## Calling programs

ApisCP provides a specialized library, [Util_Process](https://github.com/apisnetworks/util-process), for simplifying program execution. Arguments may be presented as sprintf arguments or by using name backreferences. You can even mix-and-match named and numeric backreferences (although highly discouraged and liable to result in 10,000v to the nipples!)

```php
$ret = Util_Process::exec('echo %(one)s %(two)d %3$s', ['one' => 'one', 'two' => 2, 3]);
print $ret['output'];
exit($ret['success']);
```

In addition to basic process execution, the following variations are implemented:

| Process Type | Purpose                                  | Caveats                                  | Usage                                    |
| ------------ | ---------------------------------------- | ---------------------------------------- | ---------------------------------------- |
| Process      | General process invocation               | Unsafe                                   | `$proc = new Util_Process(); $proc->run("echo 'hello world!'");` |
| Batch        | atd batch run                            | Dependent upon system load               | `$proc = new Util_Process_Batch(); $proc->run('echo "hello %d"', time());` |
| Chroot       | jail execution to directory              | Slow                                     | `$proc = new Util_Process_chroot("/home/virtual/site12/fst"); $proc->run("hostname");` |
| Fork         | Immediately fork + run program           | Unable to capture exit code/success. Requires absolute paths. | `$proc = new Util_Process_Fork(); $proc->run("sleep 60 ; touch /tmp/abc"); echo "Off she goes!";` |
| Safe         | Escape program arguments                 | Arguments must be named                  | `$proc = new Util_Process_Safe(); $proc->run("echo %(hello)s %(time)d %(naughty)s", ['hello' => "hello world!", 'time' => time(), 'naughty' => ':(){ :\|: & };:']);` |
| Schedule     | Run command at a specified time          | Depends upon PHP's [strtotime](http://php.net/manual/en/function.strtotime.php) interpretation | `$proc = new Util_Process_Schedule("tomorrow"); $proc->run("yawwwwn!");` |
| Sudo         | Switch user. Automatically scope active session. | Slow. Must be run from backend.          | `$proc = new Util_Process_Sudo(); $proc->setUser('nobody'); $proc->run("whoami");` |
| Tee          | Copy output elsewhere                    | ???                                      | `$tee = new Util_Process_Tee(['tee' => '/tmp/flapjacks'); $proc = new Util_Process(); $tee->setProcess($proc); $proc->run("dmesg");` |

### Allowing exit values

UP treats all non-zero exit codes as errors. `success` is a shorthand way to check if the exit code, stored in `return` is zero or non-zero. To extend the range of successful values, supply an additional parameter, or stash it in the config parameter, with exit codes that can either be a regex or array of acceptable values.

```php
$proc = new Util_Process();
$proc->exec('false', [0,1]);
$proc->exec('false', '/^[01]$/');

// alternatively
$proc->setExit([1]);
$proc->exec('false');
```

Both are equivalent and accept a single exit value, "0" or "1".

> Traditionally, 0 is used to signal success with Linux commands. A non-zero return can correspond to any one of numerous [error codes](http://man7.org/linux/man-pages/man3/errno.3.html). It is rare for a command that runs successfully to exit with a non-zero status.

# Creating modules

Modules expose an interface for the end-user to interact with from not only the panel, but also API. A module is named *ModuleName*_Module and located in `lib/modules/`. Modules must extend `Module_Skeleton`. Any public method exposed in the module that does not begin with "\_" and has permissions assigned other than `PRIVILEGE_NONE` AND `PRIVILEGE_SERVER_EXEC` is callable from the panel or API. Module rights are discussed a little further under **PERMISSIONS**.

A sample class implementation is found under `modules/example.php`.

## Extending modules with surrogates

A module may be extended with a "surrogate". Surrogates are delegated modules loaded in lieu of modules that ship with ApisCP. Surrogates ar e located under modules/surrogates/*\<module name>*.php. Unless the class name is explicitly called, e.g. `User_Module::MIN_UID`, a surrogate will be loaded first, e.g. $this->user_get_home() will check for modules/surrogates/user.php and use that instance before using modules/user.php. A surrogate or native class can be determined at runtime using `apnscpFunctionInterceptor::autoload_class_from_module()`, e.g. `apnscpFunctionInterceptor::autoload_class_from_module('user') . '::MIN_UID'`. Depending upon the presence of surrogates/user.php (override of User_Module), that or modules/user.php (native ApisCP module) will be loaded.

::: tip
"apnscpFunctionInterceptor" can also be referenced in code as "a23r" for brevity.
:::

Surrogates *should* extend the module for which they are a surrogate; however, can instead extend Module_Skeleton directly to remove built-in methods although this practice is strongly discouraged. Blacklist all methods by setting ['*' => 'PRIVILEGE_NONE']  to your **PERMISSIONS** discussed below.

To ensure an override surrogate is called when explicitly calling a class, use `apnscpFunctionInterceptor::autoload_class_from_module()`. For example,

```php
/**
 * reference either User_Module or User_Module_Surrogate depending
 * upon implementation
 */
$class = apnscpFunctionInterceptor::autoload_class_from_module("user");
echo $class, $class::MIN_UID;
```

### Sample surrogate

The following surrogate extends the list of nameservers (**[dns]** => **hosting_ns** in config.ini) that a domain may be delegated to pass the nameserver check. Note, this has no enforcement if **[domains]** => **dns_check** is set to "0" in config.ini.

::: warning
**Remember**: New surrogates are not loaded until the active session has been destroyed via logout or other means
:::

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

### Aliasing

A surrogate may exist without a named module in `lib/modules/`. In such cases, for example, `Example_Module` will automatically load `Example_Surrogate_Module` and alias the class to `Example_Module` if `lib/modules/example.php` does not exist.

## Proxied modules ("Providers")

A module is proxied if it loads another module in place of itself determined at call-time. For example, consider an account that has a different DNS provider. This information isn't known until the module is initialized and account context data available. These modules implement `Module\Skeleton\Contracts\Proxied`. Once context is populated and `__construct` called, `_proxy()` is invoked to load the appropriate module definition.

```php
<?php declare(strict_type=1);

 class Sample_Module extends Module_Skeleton implements \Module\Skeleton\Contracts\Proxied
    {
        public function _proxy() {
            if ('builtin' === ($provider = $this->getConfig('sample', 'provider'))) {
                return $this;
            }
            return \Module\Provider::get('sample', $provider, $this->getAuthContext());
        }
    }
```

Where the module provider is referenced by `Opcenter\Sample\Providers\\<$provider>\Module` adhering to [studly case](https://stackoverflow.com/questions/32731717/what-is-the-difference-between-studlycaps-and-camelcase) per PSR. The Module class must implement `Module\Provider\Contracts\ProviderInterface`. The provider can be configured for the site by creating a [service definition](#service-definitions) called sample with an service name `provider`.

```bash
EditDomain -c sample,provider=builtin domain.com
# or...
EditDomain -c sample,provider=custom domain.com
```

"builtin" by convention should refer to the native module first called, i.e. `_proxy()` should return itself.

## Permissions

Despite the misnomer, permissions are referred internally as "privileges". Note "privilege" and "permission" are used interchangeably in this section and for simplicity, imply the same meaning throughout this documentation.

> Traditionally a privilege is something you have. A permission is something you need.

Modules comprise a variety methods and require specific access rights to protect access. A module can exist independent or surrogate an existing module. Module rights are designated via the `$exportedFunctions` class variable.

| Privilege Type        | Role                                     |
| --------------------- | ---------------------------------------- |
| PRIVILEGE_NONE        | Revokes access to all roles and all scenarios |
| PRIVILEGE_SERVER_EXEC | Method may only be accessed from backend by first calling `$this->query()` |
| PRIVILEGE_ADMIN       | Method accessible by appliance administrator |
| PRIVILEGE_SITE        | Method accessible by site administrator  |
| PRIVILEGE_USER        | Method accessible by secondary users     |
| PRIVILEGE_RESELLER    | Reserved for future support.             |
| PRIVILEGE_ALL         | All roles may access a method. Does not supersede PRIVILEGE_SERVER_EXEC. |

### Mixing permissions

Permissions may be added using bitwise operators to further restrict module entry point or role type.

For example, `PRIVILEGE_SERVER_EXEC|PRIVILEGE_SITE` requires the method call originate from the backend as `query('class_method', \$arg1, \$arg2)` and may only be invoked as a module entry point if the user is a Site Administrator.

Likewise, once a module has been entered, permissions can optionally no longer apply.

```php
class My_Module extends Module_Skeleton {
    public $exportedFunctions = [
        'entry' => PRIVILEGE_SITE,
        'blocked' => PRIVILEGE_SITE|PRIVILEGE_SERVER_EXEC
    ];

    public function entry() {
        if (!$this->my_blocked()) {
            error("failed to enter blocked module from frontend");
        }
        if (!$this->blocked()) {
            error("this will never trigger");
        }
        return $this->query('my_blocked');
    }

    public function blocked() {
        echo "Accessible from ", IS_CLI ? 'CLI' : 'UI';
        echo "Caller: ", \Error_Reporter::get_caller();
        return "Hello from backend!";
    }
}
```

## Configuration

ApisCP provides 3 general purpose configuration files in `config/`:

- `db.yaml` database configuration
- `auth.yaml` third-party configuration/API keys
- `custom/config.ini`, overrides defaults in config.ini. **Do not make changes in** `config.ini`. `cpcmd config:set cp.config section option value` is a Scope to facilitate usage.

Configuration within `db.yaml` is prefixed with "DB\_". Configuration within `auth.yaml` is prefixed with "AUTH\_" to reduce the risk of collision between sources. Configuration in `custom/config.ini` is presented as-is. Values are transformed into constants on ApisCP boot. Any changes require a restart, `systemctl restart apiscp`.

For example,

```yaml
# db.yaml
##########
crm:
  host: localhost
  username: myuser

# auth.yaml
###########
dns:
  key: abcdef
  uri: https://foobar.com/endpoint
```

```ini
# custom/config.ini
###################
[dns]
soft_delete=1
```

All three files are translated into different constants available throughout the application,

```php
<?php
 var_dump(
  DB_CRM_HOST,
  DB_CRM_USERNAME,
  AUTH_DNS_KEY,
  AUTH_DNS_URI,
  DNS_SOFT_DELETE
 );
```

Given the propensity for conflicts to exist between multiple modules, it is recommended to avoid vague or generic configuration variables, such as the examples above if a panel may run more than 1 variation of a module.

# Creating applications

## Application structure

All apps are located under `apps/`. The "App ID" is the folder under which the application is located. A sample application named "test" is bundled with ApisCP. A controller must be named after the App ID and end in ".php". The default view may be named after the App ID and end in ".tpl" or located as views/index.blade.php if using Blade.

::: warn Naming restrictions
Apps may not have underscore ("_") in the name. autoload will automatically convert - to _ during namespace resolution. Use "-" as a delimiter, which is URL-friendly.
:::

## Controller/Model

Controller/Model logic is located in apps/*\<APP NAME>*/*\<APP NAME>*.php and instantiated first. The class name must be named Page and placed in a namespace named after the app ID. An example app named "Test" is located under apps/test/.

Interoperability with Laravel exists in the [Laravel](#laravel-integration) section.

::: warning
Controllers will be subject to API changes in the near future.
:::

### Hooks

ApisCP controllers provide a few attachment points for hooks.

| Hook        | When                | Notes                                    |
| ----------- | ------------------- | ---------------------------------------- |
| _init       | After constructor   | Must call parent. Postback is not processed yet. |
| on_postback | After _init()       | Handle form interaction, classic controller |
| _layout     | After on_postback() | Must call parent. Calculate head CSS/JS elements. Unavailable in AJAX requests. |
| _render     | After _layout()     | Template engine is exposed. Recommended time to share Blade variables |

## Laravel integration

ApisCP uses [Laravel Blade](https://laravel.com/docs/6.x/blade) bundled with Laravel 6 for templates or basic "include()" if the template is named *\<APP NAME>*/*\<APP NAME>*.tpl

### Blade

Create a file named under `apps/custom/`  named *\<APP NAME>*/views/index.blade.php. This will be the initial page index for the app. $Page will be exposed along with a helper method, \$Page->view() to get an instance of \Illuminate\View. All Blade syntax will work, including extending with new directives:

```php
/** pull from resources/views **/
$blade = \Blade::factory();
$blade->compiler()->directive('datetime', function ($expression) {
    return "<?php echo with({$expression})->format('F d, Y g:i a'); ?>";
});
```

#### Sharing variables
Model variables can be exported to a Blade view in the "_render" hook. This feature is unavailable when using the built-in lean .tpl format.

```php
public function _render() {
 $this->view()->share(['options' => $this->getOptions()]);
}
```

#### Using Blade outside apps

Blade templates may be overridden outside of apps, such as with email templates or provisioning templates, by copying the asset to `config/custom/`*\<NAMED PATH>*.

For example, to override how Apache VirtualHosts are constructed during account creation:

Copy resources/templates/apache/virtualhost.blade.php to config/custom/resources/templates/apache/virtualhost.blade.php, this can be done by creating the necessary directory structure + copying the file:

```bash
cd /usr/local/apnscp
mkdir -p config/custom/resources/templates/apache
cp -dp resources/templates/apache/virtualhost.blade.php config/custom/resources/templates/apache/
```

##### Configuration templates

`ConfigurationWriter` is a special instance of Blade that looks for Blade templates under resources/templates. The same resolution technique is used: first config/custom/&lt;PATH&gt; followed by &lt;PATH&gt;.

```php
// Create an authentication context that will be passed as $svc
$ctx = SiteConfiguration::import($this->authContext)
// Look for resources/mail/webmail-redirect.blade.php
$config = (new \Opcenter\Provisioning\ConfigurationWriter("mail/webmail-redirect", $ctx))
	->compile([
		// pass $mailpath as '/some/path'
		'mailpath' => '/some/path'
	]);

// Convert the template to a string, outputting its results
echo (string)$config;
```

### Router

If a file named *routes.php* is present in the application directory, Laravel routing will be used to handle requests. A sample app is available under */apps/template*.

## Configuring app visibility

Applications are privileged by role: admin, site, and user. Applications are configured initially via lib/html/templateconfig-\<ROLE>.php. Custom app overrides are introduced in conf/custom/templates/\<ROLE>.php. For example, to create a new category and add an app,

```php
    $templateClass->create_category(
        "Addon Category",
        true, // always show
        "/images/custom/addonappicon.png", // icon indicator
        "myaddon" // category name
    );
    $templateClass->create_link(
        "Internal Benchmark",
        "/apps/benchmark",
        is_debug(), // condition to load category
        null, // no longer used
        "myaddon" // category reference
    );
```

### Dynamic namespaces
**New in 3.2.34**

Both views and routes support namespace usage beginning with `@` and delimited by `::`. These additional namespaces may be hooked into `config/custom/boot.conf`. `@app(APP-ID)` is pre-registered for access to [named routes](https://laravel.com/docs/6.x/routing#named-routes) and views.

```php
\Lararia\Routing\NamespacedRouteCollection::registerDynamicNamespace('@foo', static function (string $parameter) {
    // return a value compatible with Route::group(...), "as" becomes name
    return [
        [
            // If 'as' is not set it will default to the NAMESPACE-PREFIX(PARAMETER)
            'as'        => "@foo($parameter)::",
            'namespace' => (new \ReflectionClass(\Page_Container::kernelFromApp($parameter)))->getNamespaceName(),
            'prefix'    => \Template_Engine::init()->getPathFromApp($app)
        ],
        \Page_Container::resolve($parameter, 'routes.php')
    ];
});
```
```php
/** routes.php */
Route::get('/', static function() { 
	return "Hello World!";
})->name('baz');
```

```php
/** Sample view referencing route */
{{ route(@foo(bar)::baz) }}
```

Dynamic views work similarly to dynamic routes.

```php
\Lararia\Routing\NamespacedViewFinder::registerDynamicNamespace('@foo', static function (string $parameter) {
	// return a string used in view path resolution (see FileViewFinder::addNamespace())
    // NB: config/custom/<PATH> is added before this path.
    // "config/custom/addons/bar/views" in the below example
    return config_path('addons/foo/views')
})
```

Variables are not automatically shared with the view. Instantiate them, including `$Page`, which is a reference to the application kernel, on inclusion if referenced.

```php
@include('@foo(bar)::hello', ['link' => route('@foo(bar)::index'), 'Page' => \Page_Container::initApp('foo')])
```

And `config/custom/addons/foo/views/hello.blade.php`

```php
Current kernel: {{ get_class($Page) }}
<a href="{{ $link }}">{{ $link }}</a>
```



:::warning Self-referential routes
Route references within an app must not use the `@app(APP-ID)` markup as this will force unnamed routes to become disassociated.
:::


# Using Composer

ApisCP ships with support for the PHP dependency/package manager, [Composer](https://getcomposer.org).

::: danger
Use config/custom/ as your location to install Composer packages. Do not install custom packages under the top-level directory. They will be erased on an ApisCP update.
:::

To install a package switch to conf/config and install the package as you normally would,

```bash
cd /usr/local/apnscp/conf/custom
composer require psr/log
```

# Themes

ApisCP comes with a separate [theme SDK](https://github.com/apisnetworks/apnscp-bootstrap-sdk) available on Github. Global themes can be inserted into `public/css/themes/`. Default theme is adjusted via **[style]** => **theme**. Users can build and install their own themes if **[style]** => **allow_custom** is enabled.

# Module hooks

Several hooks are provided to latch into ApisCP both for account and user creation. All hook names are prefixed with an underscore ("_"). All hooks run under Site Administrator privilege ("*PRIVILEGE_SITE*"). Any module that implements one must implement all hooks as dictated by the `\Opcenter\Contracts\Hookable` interface.

| Hook        | Event Order | Description                              | Args                     |
| ----------- | ----------- | ---------------------------------------- | ------------------------ |
| delete_user | before      | user is deleted                          | user                     |
| delete      | before      | account is deleted *or service disabled* |                          |
| create      | after       | account is created *or service enabled*  |                          |
| create_user | after       | user is created                          | user                     |
| edit        | after       | account metadata changed                 |                          |
| edit_user   | after       | user is edited                           | olduser, newuser, oldpwd |
| verify_conf | before      | verify metadata changes                  | ConfigurationContext ctx |

```php
/**
 * Sample module edit hook, which runs under the context
 * of the edited account with Site Administrator privilege
 */
public function _edit() {
 // note that cur will always be merge: new -> old for edit hook
 // thus to look at old data, peek at old never cur
 // cur may be used for create/delete
    $new = $this->getAuthContext()->conf('siteinfo', 'new');
    $old = $this->getAuthContext()->conf('siteinfo', 'old');
    if ($new === $old) {
        // no change to "siteinfo" service module
        return;
    }
    if ($new['admin_user'] !== $old['admin_user']) {
        // admin username change, do something
    }
    return true;
}
```

```php
/**
 * Sample module edit_user hook, which runs under the context
 * of the edited account with Site Administrator privilege
 */
public function _edit_user(string $olduser, string $newuser, array $oldpwd) {
    $pwd = $this->user_getpwnam($newuser);
    if ($pwd === $oldpwd) {
        // no change to passdb for user
        return;
    }

    if ($olduser !== $newuser) {
        // username change, do something
    }
    return true;
}
```

### Special case service enablement/disablement

`create` and `delete` are called when a mapped service configuration (discussed below under "[Mapped Services](#Mapped services)") is enabled or disabled **instead of** `edit`. For example, these three cases assume that "aliases" is disabled for a site (`aliases`,`enabled=0`). Aliases are brought online for the site debug.com with `EditDomain -c aliases,enabled=1 -c aliases,aliases=['foobar.com'] debug.com`.

## Verifying configuration

`verify_conf` hook can reject changes by returning a false value and also alter values. `$ctx` is the module configuration passed by reference. By

```php
public function _verify_conf(\Opcenter\Service\ConfigurationContext $ctx): bool {
    if (!$ctx['enabled']) {
        return true;
    }
    if (!empty($ctx['tpasswd'])) {
        $ctx['cpasswd'] = \Opcenter\Auth\Shadow::crypt($ctx['tpasswd']);
       $ctx['tpasswd'] = null;
    } else if (empty($ctx['cpasswd'])) {
        return error("no password provided!");
    }
   // do something
}
```

Likewise the module metadata may look like

```ini
[myservice]
enabled = 1
tpasswd =
cpasswd =
```

## Event-driven callbacks

ApisCP features a lightweight global serial callback facility called Cardinal. This is used internally and not [context-safe](#contextables).

# API hooks

API hooks are a simple form of responding to API interaction in the control panel. This is covered in detail in [Hooks.md](admin/Hooks.md). 

# Service Definitions

Every account consists of metadata called "Service Definitions" that describe what an account is, what features it has, and how it should be handled through automation. Examples of metadata include the administrative login (`siteinfo`,`admin_user`), database access (`mysql`,`enabled` and/or `pgsql`,`enabled`), billing identifier (`billing`,`invoice`), addon domains (`aliases`,`aliases`), or even extended filesystem layers conferred through service enablement, such as (`ssh`,`enabled`) that merges command-line access into an account.

All natively derivable Service Definitions exist as templates in [plans/.skeleton](https://bitbucket.org/apisnetworks/apnscp/src/master/resources/templates/plans/.skeleton/?at=master). Any definition beyond that may be extended, just don't override these definitions and read along!

A new plan can be created using Artisan.

```bash
./artisan opcenter:plan --new newplan
```

All files from `resources/plans/.skeleton` will be copied into `resources/plans/newplan`. Do not edit .skeleton. 10,000v to the nipples shall ensue for violators. A base plan can be assigned to a site using -p or --plan,

```bash
AddDomain -p newplan -c siteinfo,domain=newdomain.com -c siteinfo,admin_user=myadmin
```

Moreover, the default plan can be changed using Artisan.

```bash
./artisan opcenter:plan --default newplan
```

Now specifying `-p` or `--plan` is implied for site creation.

## Mapped services

A mapped service connects metadata to ApisCP through a Service Validator. A Service Validator can accept or reject a sequence of changes determined upon the return value (or trigger of error via [error()](#ER message buffer macros)). Service Validators exist in two forms, as modules through `_verify_conf` [listed above](#Verifying configuration) and classes that reject early by implementing `ServiceValidator`; such objects are mapped services.

## Definition behaviors

Certain services can be triggered automatically when a service value is toggled or modified.

### MountableLayer

`MountableLayer` may only be used on "enabled" validators. When enabled, a corresponding read-only filesystem hierarchy under `/home/virtual/FILESYSTEMTEMPLATE` is merged into the account's [filesystem](https://docs.apiscp.com/admin/managing-accounts/#account-layout).

### ServiceInstall

`ServiceInstall` contains two methods `populate()` and `depopulate()` called when its value is 1 and 0 respectively. This provides granular control over populating services whereas `MountableLayer` merges the corresponding filesystem slice.

### ServiceReconfiguration

Implements `reconfigure()` and `rollback()` methods, which consists of the old and new values on edit. On failure `rollback()` is called. Rollback is not compulsory.

### AlwaysValidate

Whenever a site is created or edited, if a service definition implements `AlwaysValidate`, then the `valid($value)` will be invoked to ensure changes conform to the recommended changes. Returning `FALSE` will halt further execution and perform a rollback through `depopulate()` of any previously registered and confirmed services.

### AlwaysRun

Service Definitions that implement `AlwaysRun` invert the meaning of `ServiceLayer`. `populate()` is now called whenever its configuration is edited or on account creation and `depopulate()` is called when an account is deleted or an edit fails. It can be mixed with `AlwaysValidate` to always run whenever a service value from the service is modified. An example is creating the maildir folder hierarchy. `version` is always checked (`AlwaysValidate` interface) and `Mail/Version` will always create mail folder layout regardless mail,enabled is set to 1 or 0.

## Creating service definitions

Service definitions map account metadata to application logic. First, let's look at a hypothetical service  example that enabled Java for an account.

```ini
[java]
version=3.0 ; ApisCP service version, tied to panel. Must be 3.0.
enabled=1   ; 1 or 0, mounts the filesystem layer
services=[] ; arbitrary list of permitted services implemented by module
```

This service lives in `resources/plans/java/java` where the first `java` is the plan name and second, service named java. A new plan named java can be created using Artisan.

```bash
cd /usr/local/apnscp
./artisan opcenter:plan --new java
```

All files from `resources/plans/.skeleton` will be copied into `resources/plans/java`.

A base plan can be assigned to a site using `-p` or `--plan`,

```bash
AddDomain -p java -c siteinfo,domain=newdomain.com -c siteinfo,admin_user=myadmin
```

Moreover, the default plan can be changed using Artisan.

```bash
./artisan opcenter:plan --default java
```

Now specifying `-p` or `--plan` is implied for site creation.

# Validating service configuration

Let's create a validator for *enabled* and *services* configuration values.

### Opcenter\Validators\Java\Enabled.php

```php
<?php declare(strict_types=1);
    /**
     * Simple Java validator
     */

    namespace Opcenter\Service\Validators\Java;

    use Opcenter\SiteConfiguration;
    use Opcenter\Service\Contracts\MountableLayer;
    use Opcenter\Service\Contracts\ServiceInstall;

    class Enabled extends \Opcenter\Service\Validators\Common\Enabled implements MountableLayer, ServiceInstall
    {
        use \FilesystemPathTrait;

        /**
         * Validate service value
         */
        public function valid(&$value): bool
        {
            if ($value && !$this->ctx->getServiceValue('ssh','enabled')) {
                return error('Java requires SSH to be enabled');
            }

            return parent::valid($value);
        }

        /**
         * Mount filesystem, install users
         *
         * @param SiteConfiguration $svc
         * @return bool
         */
        public function populate(SiteConfiguration $svc): bool
        {
   return true;
        }

        /**
         * Unmount filesytem, remove configuration
         *
         * @param SiteConfiguration $svc
         * @return bool
         */
        public function depopulate(SiteConfiguration $svc): bool
        {
         return true;
        }
 }
```

`$this->ctx['var']` allows access to other configuration values within the scope of this service. `$this->ctx->getOldServiceValue($svc, $var)` returns the previous service value in `$svc` while `$this->ctx->getNewServiceValue($svc, $var)` gets the new service value if it is set.

`MountableLayer` requires a separate directory in `FILESYSTEMTEMPLATE/` named after the service. This is a read-only layer that is shared across all accounts that have the service enabled. ApisCP ships with `siteinfo` and `ssh` service layers which provide basic infrastructure.

### Service mounts

Service mounts are part of `MountableLayer`. Create a new mount named "java" in `/home/virtual/FILESYSTEMTEMPLATE`. You can optionally install RPMs using Yum Synchronizer, which tracks and replicates RPM upgrades automatically.

`-d` is a special flag that will resolve dependencies when replicating a package and ensure that those corresponding packages appear in at least 1 service definition. When dependencies or co-dependencies will be noted as an INFO level during setup. When `-d` is omitted only the specified package will be installed.

## Opcenter\Validators\Java\Services.php

```php
<?php declare(strict_types=1);

    namespace Opcenter\Service\Validators\Java;

    use Opcenter\Service\ServiceValidator;

    class Services extends ServiceValidator
    {
        const DESCRIPTION = 'Enable Java-based services';
        const VALUE_RANGE = ['tomcat','jboss'];

        public function valid(&$value): bool
        {
            if ($value && !$this->ctx['enabled']) {
                warn("Disabling services - java disabled");
                $value = [];
            } else if (!$value) {
                // ensure type is array
                $value = [];
                return true;
            }
            if (!$value) {
                $value = [];
            }

            // prune duplicate values
            $value = array_unique($value);

            foreach ($value as $v) {
                if (!\in_array($v, self::VALUE_RANGE, true)) {
                    return error("Unknown Java service `%s'", $v);
                }
            }

            return true;
        }
    }
```

> By convention, variables that triggered an error are enclosed within `' or prefixed with ":" for multi-line responses, such as stderr. While not mandatory, it helps call out the value that yielded the error and when the variable is omitted rather verbosely.

To keep things simple for now, the service validator checks if the services configured are tomcat or jboss. We'll tie this logic back into the "enabled" service validator. For now to enable this service is simple:

# Contextables

Modules support **contextability**, which allows a new authentication role to be used throughout the scope. A context is created by first scaffolding a user session, then attaching it to an apnscpFunctionInterceptor instance,

```php
// create a new site admin session on debug.com
// returns \Auth_Info_User instance
$context = \Auth::context(null, 'debug.com');
$afi = \apnscpFunctionInterceptor::factory($context);
// print out the admin email attached to debug.com
echo $afi->common_get_admin_email();
```

::: danger
Juggling contexts is dangerous and under early development. Use with care. It is recommended to package any contextable changes with unit tests. A framework is available under `test/contextable`.
:::

## Cache access

Contextables must pass the active instance when accessing User and Account caches. This can be done by passing the `Auth_Info_User` instance to `spawn()`

```php
$context = \Auth::context(null, 'debug.com');
$cache = \Cache_Account::spawn($context);
// pull user cache from debug.com - if populated
$cache->get('users.pwd.gen');
```

## Preferences and Session access

ApisCP includes wrappers to user preferences and session data via `Preferences` and `Session` helper classes. Session access is not supported within a contextable role. Sessions are temporary storage and thus have no utility for a contexted authentication role.

Preferences may be accessed and unlocked for write-access. An afi instance must be created to allow the Preference helper storage to save modified preferences.

```php
$user = \Auth::context('jim');
$prefs = \Preferences::factory($user);
// necessary to provide API access to the preference helper
$prefs->unlock(\apnscpFunctionInterceptor::factory($user));
$prefs->set("foo.bar", "baz"); // assign "baz" to [foo][bar]
$prefs = null; // save
```

Failure to graft an afi instance will result in a fatal error on write access. afi grafting is not necessary for read access.

## Detecting contextability

Modules that use the `apnscpFunctionInterceptorTrait` also include a helper function `inContext()` to determine whether the current API call is bound in a contextable scope.

## Limitations

Contextables may not be used in reliable, safe manner to access other URIs in ApisCP. Contextables are considered "safe" with module access. Contextables should be used with caution with third-party modules as safety is not guaranteed.

### Avoiding state corruption

Use of any **singleton that is dependent on user roles violates contextability**. Example calls that lose state and use the first authenticated instance include:

| Context Safety | Snippet                                                      |
| :------------: | ------------------------------------------------------------ |
|       ❌        | `apnscpFunctionInterceptor::init()->call('some_fn')`         |
|       ✅        | `apnscpFunctionInterceptor::factory(Auth_Info_User $context)` |
|       ❌        | `DataStream::get()->write(string $payload)`                  |
|       ✅        | `DataStream::get(Auth_Info_User $context)->write($payload)`  |
|       ❌        | `Cache_Account::spawn()->get('foo.bar')`                     |
|       ✅        | `Cache_Account::spawn(Auth_Info_User $context)->get('foo.bar')` |
|       ❌        | `Session::get('entry_domain')`                               |
|                | **N/A** *sessions are not supported in contexted roles*      |
|       ❌        | `Preferences::get('webapps.paths')`                          |
|       ✅        | `array_get(Preferences::factory(Auth_Info_User $context), 'webapps.paths')` |

# Jobs

ApisCP includes job management through [Laravel Horizon](https://horizon.laravel.com). Jobs run in a dedicated process, `horizon`, or as a spawnable one-shot queue manager that periodically runs `artisan queue:run`. When in low memory situations, set **[cron]** -> **low_memory**=**1** (see [Configuration](#Configuration)) to use the slower one-short, periodic queue manager.

## Writing Jobs

Jobs should implement `\Lararia\Job`, which serves as a base for all ApisCP jobs. Lararia jobs will properly convey `error()`, `warn()`, and `info()` API error reporting macros to the job daemon. "`error()`" indicates a fatal, non-recoverable job failure.  All ER events are bundled in a job report, `\Lararia\Job\Report`.

```php
<?php declare(strict_types=1);

    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Support\Facades\Event;
    use Lararia\Jobs\Job;
    use Laravel\Horizon\Events\JobFailed;

    class TestJob extends Job implements ShouldQueue {

        protected $msg;
        protected $filename;

        public function __construct(string $msg)
        {
            $this->msg = $msg;
            $this->filename = tempnam(TEMP_DIR, 'test-msg');
            unlink($this->filename);
        }

        public function fire()
        {
            $filename = $this->getFilename();
            Event::listen(JobFailed::class, function ($job) use($filename) {
                file_put_contents($filename, $this->getLog()[0]['message']);
                return null;
            });
            return error($this->msg);
        }

        public function getFilename() {
            return $this->filename;
        }
    }
```

then to fire the job,

```php
$job = (\Lararia\Jobs\Job::create(SampleJob::class, "Test message"));
$file = $job->getFilename();
$job->dispatch();
$job = null;

do {
  sleep(1);
} while (!file_exists($file));
echo "Contents: ", file_get_contents($file);
unlink ($file);
```

::: tip
Note that the job must go out of scope to dispatch as the dispatch logic is contained in its destructor.
:::

## Binding context

ApisCP supports binding authentication contexts to a job, for example to run an API command as another user. This is done using the`RunAs` trait and setting context before dispatching the job.

```php
<?php declare(strict_types=1);

    use Lararia\Jobs\Job;
    use Lararia\Jobs\Traits\RunAs;

    class TestJob extends Job {

        use RunAs;
        use \apnscpFunctionInterceptorTrait;

        public function fire()
        {
            return $this->common_get_domain();
        }
    }

    $job = new TestJob();
    $job->setContext(\Auth::context(null, 'testing.com'));
    $job->dispatch();

```

# Migrations

ApisCP supports Laravel Migrations to keep database schema current. Migrations come in two forms **database** and **platform**. Database migrations use Laravel's [schema builder](https://laravel.com/docs/5.7/migrations). Platform migrations integrate [Bootstrapper](https://github.com/apisnetworks/apnscp-playbooks). All pending migrations may be run with `artisan migrate`

Updating the control panel through `upcp` automatically deploys these migrations when present. Enabling automatic panel updates (`cpmd scope:set cp.nightly-updates 1` ) also runs migrations every night during panel updates.

## Database migration

Create a new database migration using Artisan

```bash
cd /usr/local/apnscp
./artisan make:migration migration_name
```

Migration will be located in `resources/database/migrations`.

## Platform migration

A platform migration may be created by passing `--platform` to `make:migration`,

```bash
cd /usr/local/apnscp
./artisan make:migration --platform migration_name
```

The play will be located in `resources/playbooks/migrations`.

A migration consists of two parts: **up** and **down.** **up** is used when a migration is first run. **down** is used to revert changes (similar structure exists in database migrations). **down** is  not required to implement, but encouraged.

Migrations are run whenever panel code is updated via [upcp](UPGRADING.md) or may be invoked manually. Once automatically run, a migration is committed to database (`apnscp.migrations` table in MySQL).

```bash
cd /usr/local/apnscp/
./artisan make:migration --platform test
# Created Migration: 2021_01_14_000006_test
cd resources/playbooks
# Test it manually
ansible-playbook migrator.yml --tags=up --extra-vars=migrations=2021_01_14_000006_test
# Commit migration to database
cd /usr/local/apnscp
./artisan migrate --force
```

Migrations are run in batches. `./artisan migrate:rollback` will rollback all migrations run in the *last batch*, which is to say all migrations run in the last invocation of `upcp`.