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
      return warn('I guess that is OK!');
	}
	return error('Bad value! `%s\'', $x);
}
```

ER supports argument references as well utilizing [sprintf](http://php.net/manual/en/function.sprintf.php).

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

## Extending Methods

### Permissions

Modules comprise a variety methods and require specific access rights to protect access. A module can exist exist independent or surrogate an existing module. 