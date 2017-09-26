---
layout: docs
title: Programming Guide
group: development
---

* ToC
{:toc}

# Basics

apnscp is designed to be flexible and fast. Because apnscp cannot exist without a broker (apnscpd) to transfer critical unprivileged code to privileged backend tasks, a critical choke also exists between this transfer (`$this->query('method', $args)`). Backend methods are designed to be thin. Make your frontend however you want, but inversely proportion complexity to backend calls as they bear the brunt of the logic and each backend roundtrip costs 0.1 ms when session resumption can be used. Without resumption each request is 6x slower.

## Invocation Flow

apnscp is partitioned into 2 components: an unprivileged frontend (typically runs as user "nobody") and a privileged backend that runs as root. Methods can traverse to the backend using a special method, `query(method, arg1, arg2, argn...)`, part of `Module_Skeleton`. 

`query()` bundles the parcel along with session identifier.

```php?start_inline=1
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

Backend calls are wrapped into an `apnscpObject ` transported over a `DataStream` connection. `Module_Skeleton::query()` automatically instantiates a suitable `apnscpObject` query for use with `DataStream`. In special cases, this can be mocked up manually.

```php?start_inline=1
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

### No Wait Flag 

`apnscpObject::NO_WAIT` will send a command to backend without waiting on a response. This can be useful in situations in which data must be sent to backend, but status is immaterial. Alternatively, *NO_WAIT* can be used to return immediately provided the backend confers status by another process. An example would be exiting a 1-click install immediately and sending the response via email.

```php?start_inline=1
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

## Error Handling

### Warning on Exception Usage

Exceptions convey stack. Stack conveyance adds overhead. Do not throw exceptions in Module code, especially in file_* operations. Do not throw exceptions in any critical part of code that will not immediately terminate flow. In fact, **exception usage is discouraged unless it explicitly results in termination** (in which case, `fatal()` works better) **or a deeply nested call needs to return immediately**. 

### Non-Exception Usage

apnscp bundles a general-purpose [error library](https://github.com/apisnetworks/error-reporter) with a variety of macros to simplify life. `fatal()`, `error()`, `warn()`, `info()`, `success()`, `deprecated()`, and `debug()` log issues to the error ring. error(), warn(), info() will copy stack if in **[core]** -> **debug** is set in config.ini (see [Configuration](#Configuration)). **[core]** -> **bug_report** will send a copy of production errors to the listed address.

```php?start_inline=1
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

```php?start_inline=1
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

### Registering Message Callbacks

Register callbacks to `add_message_callback()`. For example, to dump stack on fatal errors on DAV during development (or AJAX) where unexpected output breaks protocol formatting:

```php?start_inline=1
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

### ER Message Buffer Macros

The following macros are short-hand to log messages during application execution. 

{: .table .table-striped}
| Macro             | Purpose                                  | Return Value |
| ----------------- | ---------------------------------------- | ------------ |
| fatal()           | Halt script execution, report message.   | null         |
| error()           | Routine encountered error and should return from routine. Recommended to always return. | false        |
| warn()            | Routine encountered recoverable error.   | false        |
| info()            | Additional information pertaining to routine. | true         |
| success()         | Action completed successfully.           | true         |
| debug()           | Message that only emits when DEBUG set to 1 in config.ini | true         |
| deprecated()      | Routine is deprecated. Callee included in message. | true         |
| deprecated_func() | Same as deprecated(), but include callee's caller | true         |
| report()          | Send message with stack trace to **[core]** -> **bug_report** | bool         |

## Calling Programs

apnscp provides a specialized library, [Util_Process](https://github.com/apisnetworks/util-process), for simplifying program execution. Arguments may be presented as sprintf arguments or by using name backreferences. You can even mix-and-match named and numeric backreferences (although highly discouraged and liable to result in 10,000v to the nipples!)

```php?start_inline=1
$ret = Util_Process::exec('echo %(one)s %(two)d %3$s', ['one' => 'one', 'two' => 2, 3]);
print $ret['output'];
exit($ret['success']);
```

In addition to basic process execution, the following variations are implemented:

{: .table .table-striped}
| Process Type | Purpose                                  | Caveats                                  | Usage                                    |
| ------------ | ---------------------------------------- | ---------------------------------------- | ---------------------------------------- |
| Process      | General process invocation               | Unsafe                                   | \$proc = new Util_Process(); \$proc->run("echo 'hello world!'"); |
| Batch        | atd batch run                            | Dependent upon system load               | \$proc = new Util_Process_Batch(); \$proc->run('echo "hello %d"', time()); |
| Chroot       | jail execution to directory              | Slow                                     | \$proc = new Util_Process_chroot("/home/virtual/site12/fst"); \$proc->run("hostname"); |
| Fork         | Immediately fork + run program           | Unable to capture exit code/success. Requires absolute paths. | \$proc = new Util_Process_Fork(); \$proc->run("sleep 60 ; touch /tmp/abc"); echo "Off she goes!"; |
| Safe         | Escape program arguments                 | Arguments must be named                  | \$proc = new Util_Process_Safe(); \$proc->run("echo %(hello)s %(time)d %(naughty)s", ['hello' => "hello world!", 'time' => time(), 'naughty' => ':(){ :\|: & };:']); |
| Schedule     | Run command at a specified time          | Depends upon PHP's [strtotime](http://php.net/manual/en/function.strtotime.php) interpretation | \$proc = new Util_Process_Schedule("tomorrow"); \$proc->run("yawwwwn!"); |
| Sudo         | Switch user. Automatically scope active session. | Slow. Must be run from backend.          | \$proc = new Util_Process_Sudo(); \$proc->setUser('nobody'); $proc->run("whoami"); |
| Tee          | Copy output elsewhere                    | ???                                      | \$tee = new Util_Process_Tee(['tee' => ''/tmp/flapjacks'); \$proc = new Util_Process(); \$tee->setProcess(\$proc); \$proc->run("dmesg"); |

### Allowing Exit Values

UP treats all non-zero exit codes as errors. `success` is a shorthand way to check if the exit code, stored in `return` is zero or non-zero. To extend the range of successful values, supply an additional parameter, or stash it in the config parameter, with exit codes that can either be a regex or array of acceptable values.

```php?start_inline=1
$proc = new Util_Process();
$proc->exec('false', [0,1]);
$proc->exec('false', '/^[01]$/');

// alternatively
$proc->setExit([1]);
$proc->exec('false');
```

Both are equivalent and accept a single exit value, "0" or "1". 

> Traditionally, 0 is used to signal success with Linux commands. A non-zero return can correspond to any one of numerous [error codes](http://man7.org/linux/man-pages/man3/errno.3.html). It is rare for a command that runs successfully to exit with a non-zero status.

#  Creating Modules

Modules expose an interface for the end-user to interact with from not only the panel, but also API. A module is named *ModuleName*_Module and located in `lib/modules/`. Modules must extend `Module_Skeleton`. Any public method exposed in the module that does not begin with "\_" and has permissions assigned other than `PRIVILEGE_NONE` AND `PRIVILEGE_SERVER_EXEC` is callable from the panel or API. Module rights are discussed a little further under **PERMISSIONS**.

A sample class implementation is found under `modules/example.php`.

## Extending Modules with Surrogates

A module may be extended with a "surrogate". Surrogates are delegated modules loaded in lieu of modules that ship with apnscp. Surrogates are located under modules/surrogates/*<module name>*.php. Unless the class name is explicitly called, e.g. `User_Module::MIN_UID`, a surrogate will be loaded first, e.g. $this->user_get_home() will check for modules/surrogates/user.php and use that instance before using modules/user.php. A surrogate or native class can be determined at runtime using `apnscpFunctionInterceptor::autoload_class_from_module()`, e.g. `apnscpFunctionInterceptor::autoload_class_from_module('user') . '::MIN_UID'`. Depending upon the presence of surrogates/user.php (override of User_Module), that or modules/user.php (native apnscp module) will be loaded.

Surrogates *should* extend the module for which they are a surrogate; however, can instead extend Module_Skeleton directly to remove built-in methods although this practice is strongly discouraged. Blacklist all methods by setting ['*' => 'PRIVILEGE_NONE']  to your **PERMISSIONS** discussed below.

To ensure an override surrogate is called when explicitly calling a class, use `apnscpFunctionInterceptor::autoload_class_from_module()`. For example,

```php?start_inline=1
/** 
 * reference either User_Module or User_Module_Surrogate depending 
 * upon implementation
 */
$class = apnscpFunctionInterceptor::autoload_class_from_module("user");
echo $class, $class::MIN_UID;
```

### Sample Surrogate

The following surrogate extends the list of nameservers ([dns] => hosting_ns in config.ini) that a domain may be delegated to pass the nameserver check. Note, this has no enforcement if [domains] => dns_check is set to "0" in config.ini.

{% callout warning %}
**Remember**: New surrogates are not loaded until the active session has been destroyed via logout or other means
{% endcallout %}

```php?start_inline=1
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

## Permissions

Despite the misnomer, permissions are referred internally as "privileges". Note "privilege" and "permission" are used interchangeably in this section and for simplicity, imply the same meaning throughout this documentation.

> Traditionally a privilege is something you have. A permission is something you need.

Modules comprise a variety methods and require specific access rights to protect access. A module can exist independent or surrogate an existing module. Module rights are designated via the `$exportedFunctions` class variable. 

{: .table .table-striped}
| Privilege Type        | Role                                     |
| --------------------- | ---------------------------------------- |
| PRIVILEGE_NONE        | Revokes access to all roles and all scenarios |
| PRIVILEGE_SERVER_EXEC | Method may only be accessed from backend by first calling `$this->query()` |
| PRIVILEGE_ADMIN       | Method accessible by appliance administrator |
| PRIVILEGE_SITE        | Method accessible by site administrator  |
| PRIVILEGE_USER        | Method accessible by secondary users     |
| PRIVILEGE_RESELLER    | Reserved for future support.             |
| PRIVILEGE_ALL         | All roles may access a method. Does not supersede PRIVILEGE_SERVER_EXEC. |

### Mixing Permissions

Permissions may be added using bitwise operators to further restrict module entry point or role type.

For example, `PRIVILEGE_SERVER_EXEC|PRIVILEGE_SITE` requires the method call originate from the backend as `query('class_method', \$arg1, \$arg2)` and may only be invoked as a module entry point if the user is a Site Administrator.

Likewise, once a module has been entered, permissions can optionally no longer apply.

```php?start_inline=1
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

# Creating Applications

## Application Structure

All apps are located under `apps/`. The "App ID" is the folder under which the application is located. A sample application named "test" is bundled with apnscp. A controller must be named after the App ID and end in ".php". The default view may be named after the App ID and end in ".tpl" or located as views/index.blade.php if using Blade. 

## Controller/Model

Controller/Model logic is located in apps/*<app name>*/*<app name>*.php and instantiated first. The class name must be named Page and placed in a namespace named after the app ID. An example app named "Test" is located under apps/test/.

{% callout warning %}
Controllers will be subject to API changes in the near future.
{% endcallout %}

### Hooks

apnscp controllers provide a few attachment points for hooks. 

| Hook        | When                | Notes                                    |
| ----------- | ------------------- | ---------------------------------------- |
| _init       | After constructor   | Must call parent. Postback is not processed yet. |
| on_postback | After _init()       | Handle form interaction, classic controller |
| _layout     | After on_postback() | Must call parent. Calculate head CSS/JS elements. Unavailable in AJAX requests. |
| _render     | After _layout()     | Template engine is exposed. Recommended time to share Blade variables |



## Templates

apnscp uses [Laravel Blade](https://laravel.com/docs/5.4/blade) bundled with Laravel 5.4 for templates or basic "include()" if the template is named *<app name>*/*<app name>*.tpl

### Using Blade

Create a file named *<app name>*/*<app name>*/views/index.blade.php. This will be the initial page index for the app. $Page will be exposed along with a helper method, \$Page->view() to get an instance of \Illuminate\View. All Blade syntax will work, including extending with new directives:

```php?start_inline=1
/** pull from resources/views **/
$blade = \Blade::factory();
$blade->compiler()->directive('datetime', function ($expression) {
    return "<?php echo with({$expression})->format('F d, Y g:i a'); ?>";
});
```

#### Sharing Variables

Model variables can be exported to a Blade view in the "_render" hook. This feature is unavailable when using the built-in lean .tpl format.

```php
public function _render() {
	$this->view()->share(['options' => $this->getOptions()]);
}
```



## Configuring App Visibility

Applications are privileged by role: admin, site, and user. Applications are configured initially via lib/html/templateconfig-<role>.php. Custom app overrides are introduced in conf/custom/templates/<role>.php. For example, to create a new category and add an app,

```php?start_inline=1
<?php
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



# Using Composer

apnscp ships with support for the PHP dependency/package manager, [Composer](https://getcomposer.org). 

{% callout danger %}
Use config/custom/ as your location to install Composer packages. Do not install custom packages under the top-level directory. They will be erased on an apnscp update.
{% endcallout %}

To install a package switch to conf/config and install the package as you normally would,

```bash
cd /usr/local/apnscp/conf/custom
composer require psr/log
```



# Themes

apnscp comes with a separate [theme SDK](https://github.com/apisnetworks/apnscp-bootstrap-sdk) available on Github. Global themes can be inserted into `public/css/themes/`. Default theme is adjusted via **[style]** -> **theme**. Users can build and install their own themes if **[style]** -> **allow_custom** is enabled.

# Hooks

Several hooks are provided to latch into apnscp both for account and user creation. All hook names are prefixed with an underscore ("_"). All hooks run under Site Administrator privilege ("*PRIVILEGE_SITE*"). Any module that implements one must implement all hooks as dictated by the `\Opcenter\Contracts\Hookable` interface.

{: .table .table-striped}
| Hook        | Event Order | Description              | Args                      |
| ----------- | ----------- | ------------------------ | ------------------------- |
| delete_user | before      | user is deleted          | user                      |
| delete      | before      | account is deleted       |                           |
| create      | after       | account is created       |                           |
| create_user | after       | user is created          | user                      |
| edit        | after       | account metadata changed |                           |
| edit_user   | after       | user is edited           | olduser, newuser, oldpwd  |
| verify_conf | before      | verify metadata changes  | ConfigurationContext $ctx |

```php?start_inline=1
/**
 * Sample module edit hook, which runs under the context
 * of the edited account with Site Administrator privilege
 */
public function _edit() {
    $new = Auth::conf('siteinfo', 'new');
    $old = Auth::conf('siteinfo', 'new');
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

```php?start_inline=1
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
## Verifying Configuration

`verify_conf` hook can reject changes by returning a false value and also alter values. `$ctx` is the module configuration passed by reference. By 

```php?start_inline=1
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

```
[myservice]
enabled = 1
tpasswd = 
cpasswd = 
```

## Event-Driven Callbacks

apnscp features a lightweight global callback facility called Cardinal.