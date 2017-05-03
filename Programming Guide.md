# Programming Guide

apnscp is designed to be flexible and fast. Because apnscp cannot exist without a broker (apnscpd) to transfer critical unprivileged code to privileged backend tasks, a critical choke also exists between this transfer (`$this->query('method', $args)`). Backend methods are designed to be thin. Make your frontend however you want, but inversely proportion complexity to backend calls as they bear the brunt of the logic and each backend roundtrip costs 0.1 ms when session resumption can be used. Without resumption, each request is 6x slower.

## Invocation Flow

apnscp is partitioned into 2 components: an unprivileged frontend that runs as nobody and a privileged backend that runs as root. Methods can traverse to the backend using a special method, `query(method, arg1, arg2, argn...)`, part of `Module_Skeleton`. 

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

## Error Handling

### Exception Usage

Exceptions convey stack. Stack conveyance adds overhead. Do not throw exceptions in Module code, especially in file_* operations. Do not throw exceptions in any critical part of code that will not immediately terminate flow. In fact, it's discouraged unless it explicitly results in termination (in which case, `fatal()` works better).

### Non-Exception Usage

apnscp bundles a general-purpose [error library](https://github.com/apisnetworks/error-reporter) with a variety of macros to simplify life. fatal(), error(), warn(), info(), success(), deprecated(), and debug() log issues to the error ring. error(), warn(), info() will copy stack if in core -> debug mode is set (see [Configuration](#Configuration)). core -> bug_report will send a copy of production errors to the listed address.

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
    return error("Failed to execute command. Code %(return)d. Output: %(stdout)s. Stderr: %(stderr)s", $status);
  }
}
```

### ER Message Buffer Macros
The following macros are short-hand to log messages during application execution. 

| Macro     | Purpose                                  | Return Value |
| --------- | ---------------------------------------- | ------------ |
| fatal()   | Halt script execution, report message.   | null         |
| error()   | Routine encountered error and should return from routine. Recommended to always return. | false        |
| warn()    | Routine encountered recoverable error.   | false        |
| info()    | Additional information pertaining to routine. | true         |
| success() | Action completed successfully.           | true         |
| debug()   | Message that only emits when DEBUG set to 1 in config.ini | true         |

## Calling Programs

apnscp provides a specialized library, [Util_Process](https://github.com/apisnetworks/util-process), for simplifying program execution without f'ugly backticks. Arguments may be presented as sprintf arguments or by using name backreferences. You can even mix-and-match named and numeric backreferences (although highly discouraged and liable to result in 10,000v to the nipples!)

```php
$ret = Util_Process::exec('echo %(one)s %(two)d %3$s', ['one' => 'one', 1 => 2, 3]);
print $ret['output'];
exit($ret['success']);
```

In addition to basic process execution, the following variations are implemented:

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

UP treats all non-zero exit codes as errors. `success` is a shorthand way to check if the exit code, stored in `return` is zero or non-zero. To extend the range of successful values, 

## Extending Methods

### Permissions

Modules comprise a variety methods and require specific access rights to protect access. A module can exist exist independent or surrogate an existing module. 



## Creating Applications

### Application Structure

All apps are located under `apps/`. The "App ID" is the folder under which the application is located. A sample application named "test" is bundled with apnscp. A controller must be named after the App ID and end in ".php". The default view may be named after the App ID and end in ".tpl" or located as views/index.blade.php if using Blade. 

### Controller/Model

Controller/Model logic is located in *<app name>*.php and instantiated first. The class name must be named Page and placed in a namespace named after the app ID. An example app named "Test" is located under apps/test/.

### Templates

apnscp uses [Laravel Blade](https://laravel.com/docs/5.4/blade) bundled with Laravel 5.4 for templates or basic "include()" if the template is named *<app name>*.tpl



### Configuring Role Apps

Applications are privileged by role: admin, site, and user.
