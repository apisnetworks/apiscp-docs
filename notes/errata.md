---
layout: docs
title: Errata
group: misc
---
{::options toc_levels="2..3" /}
{:toc}
* ToC 

# Panel
## shellinabox (Terminal app) fails- `forkpty() failed'

### Background

All panel components run under the user "nobody". apnscp imposes a per-group limit of 25 processes to prevent monopolization by any given service. In situations, particularly if the panel runs as prefork (*-DPREFORK* flag to `apache`) combined with a high level of cron workers and backend processes, shellinabox (or other components) will fail to spawn. This is most evident in shellinabox responded with `forkpty() failed` upon access from the web portal.

### Solution

Alter the maximum number of simultaneous processes from the terminal.

```bash
sudo echo -e "nobody nproc soft 35\nnobody nproc hard 70" > /etc/security/limits.d/99-apnscp-nproc-override.conf
```

This will create 2 entries in /etc/security/limits.d/99-apnscp-nproc-override.conf that set a soft concurrent process limit of 35 processes and a hard (firm limit) of 70 processes. These numbers may be tweaked as necessary.

# Apache

##Changing cache 

apnscp ships with disk cache enabled for Apache. Cache backend can be changed from disk to memory or disabled by specifying `OPTIONS` in /etc/sysconfig/httpd. `-DNO_CACHE` disables cache support whereas `-DCACHE_MEMORY` uses shmcb to cache content. 

###Wordpress benchmark

|              | Requests/second | Request duration (mean) |
| ------------ | --------------- | ----------------------- |
| No cache     | 142 req/sec     | 7.002 ms                |
| Cache disk   | 3544 req/sec    | 0.282 ms                |
| Cache memory | 3754 req/sec    | 0.266 ms                |

\* Taken 2018/06/07 on a Core i5-4590 + NVMe running on a v7.5 apnscp platform

# selinux

## Adjusting policy definitions

{% callout info %}
SELinux support is highly experimental. If you would like to contribute to SELinux policies in apnscp, edit `resources/playbooks/apnscp-vars.yml` and run `bootstrap.yml`. A reboot will be required.
{% endcallout %}

`audit2allow` is used to transform an audit log into SELinux policies. audit2allow is part of the `selinuxtroubleshoot` package.

```bash
yum install -y setroubleshoot
```

Specific usage is available in RedHat's SELinux documentation, [Allowing Access: audit2allow](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/6/html/security-enhanced_linux/sect-security-enhanced_linux-fixing_problems-allowing_access_audit2allow).

# MySQL

## Cyclic InnoDB crash
### Background
* **Impact:** Severe
* **Affects:** MariaDB 10.0 and lower

In certain situations, when an account has a disk quota present and the account runs over 
quota, MySQL can first crash, then on autorepair continue to crash. 

Sample from /var/log/mysqld.log:

<pre>
7f51e07fd700 InnoDB: Error: Write to file ./somedb/sometable.ibd failed at offset 180224.
InnoDB: 16384 bytes should have been written, only 0 were written.
InnoDB: Operating system error number 122.
InnoDB: Check that your OS and file system support files of this size.
InnoDB: Check also that the disk is not full or a disk quota exceeded.
InnoDB: Error number 122 means 'Disk quota exceeded'.
InnoDB: Some operating system error numbers are described at
InnoDB: http://dev.mysql.com/doc/refman/5.6/en/operating-system-error-codes.html
2017-08-02 06:12:06 7f51e07fd700  InnoDB: Operating system error number 122 in a file operation.
InnoDB: Error number 122 means 'Disk quota exceeded'.
InnoDB: Some operating system error numbers are described at
InnoDB: http://dev.mysql.com/doc/refman/5.6/en/operating-system-error-codes.html
170802  6:12:06 [ERROR] InnoDB: File ./somedb/sometable.ibd: 'os_file_write_func' returned OS error 222. Cannot continue operation
170802 06:12:06 mysqld_safe Number of processes running now: 0
170802 06:12:06 mysqld_safe mysqld restarted</pre>

### Solution
Remove the disk quota from the account temporarily to allow MySQL to repair the tables. Once the table has been repaired,
disk quotas can be reapplied to the account. 

1. Resolve which account the database is under.
    {% highlight bash %}
    $ stat -c "%G %n" `readlink /var/lib/mysql/somedb`
    admin34 /home/virtual/site34/shadow/var/lib/mysql/somedb
    {% endhighlight %}
2. Remove quota from the group
    {% highlight bash %}
    $ setquota -g admin34 0 0 0 0 -a
    {% endhighlight %}
3. Verify MySQL has started up:
    {% highlight bash %}
    $ tail -f /var/log/mysqld.log
    ... 
    YYMMDD  6:15:05 [Note] Plugin 'FEEDBACK' is disabled.
    YYMMDD  6:15:05 [Note] Server socket created on IP: '::'.
    YYMMDD  6:15:05 [Note] /usr/sbin/mysqld: ready for connections.
    Version: '10.0.31-MariaDB'  socket: '/.socket/mysql/mysql.sock'  port: 3306  MariaDB Server
    {% endhighlight %}
4. Re-enable disk quota on the account or increase it:
    {% highlight bash %}
    $ EditDomain -c diskquota,quota=20000 -c diskquota,unit=MB site34 
    {% endhighlight %}

# PostgreSQL

## Changing versions

It is recommended to NOT update PostgreSQL minor versions. PostgreSQL version is decided on initial platform provisioning and cannot be changed.

## Hardware

### TSC skew on CPU hotplug
#### Background
* **Impact:** Low
* **Affects:** All Linux guests running kvm virtualization

Attempting to hotplug a CPU into a kvm guest causes the kernel to discard timestamp counter time accounting. 
Consequently, gettimeofday() creates an expensive context-switch to the hypervisor rather than a 
low cost vsyscall. In low latency, high performance timing applications, such as Apache that 
generates hundreds of gettimeofday() syscalls a second in high traffic sites, this can create 
an unnecessary performance impact.

test.c sample:
```c
#include <stdio.h>
#include <stdlib.h>
#include <sys/time.h>

int
main(int argc, char *argv[])
{
        struct timeval tv;
        int i = 0;
        for (; i<1000000; i++) {
                gettimeofday(&tv,NULL);
        }

        return 0;
}
```

Before CPU hotplug:

```
$ time strace -c ./test
    % time     seconds  usecs/call     calls    errors syscall
    ------ ----------- ----------- --------- --------- ----------------
      0.00    0.000000           0         1           read
      0.00    0.000000           0         2           open
      0.00    0.000000           0         2           close
      0.00    0.000000           0         2           fstat
      0.00    0.000000           0         7           mmap
      0.00    0.000000           0         4           mprotect
      0.00    0.000000           0         1           munmap
      0.00    0.000000           0         1           brk
      0.00    0.000000           0         1         1 access
      0.00    0.000000           0         1           execve
      0.00    0.000000           0         1           arch_prctl
    ------ ----------- ----------- --------- --------- ----------------
    100.00    0.000000                    23         1 total
    
    real    0m0.040s
    user    0m0.032s
    sys     0m0.000s
```

Hotplug a CPU:
```bash
$ virsh setvcpus --live vm 2
```

After CPU hotplug:
```
$ dmesg
[1549221.224449] CPU2 has been hot-added
[1549221.238700] smpboot: Booting Node 0 Processor 2 APIC 0x2
[1549330.958448] kvm-clock: cpu 2, msr 8:8edf9081, secondary cpu clock
[1549330.962714] INFO: rcu_sched self-detected stall on CPU
[1549330.964513] rcu_sched kthread starved for 27432 jiffies! g105394062 c105394061 f0x0 RCU_GP_WAIT_FQS(3) ->state=0x1
[1549330.978681] Measured 3502889963798214 cycles TSC warp between CPUs, turning off TSC clock.
[1549330.978685] tsc: Marking TSC unstable due to check_tsc_sync_source failed
```

```
$ time strace -c ./test     
  % time     seconds  usecs/call     calls    errors syscall
  ------ ----------- ----------- --------- --------- ----------------
  100.00    0.020157           0   1000000           gettimeofday
    0.00    0.000000           0         1           read
    0.00    0.000000           0         2           open
    0.00    0.000000           0         2           close
    0.00    0.000000           0         2           fstat
    0.00    0.000000           0         7           mmap
    0.00    0.000000           0         4           mprotect
    0.00    0.000000           0         1           munmap
    0.00    0.000000           0         1           brk
    0.00    0.000000           0         1         1 access
    0.00    0.000000           0         1           execve
    0.00    0.000000           0         1           arch_prctl
  ------ ----------- ----------- --------- --------- ----------------
  100.00    0.020157               1000023         1 total
  
  real    0m27.677s
  user    0m2.704s
  sys     0m24.692s
```


#### Solution
No known fix. As a workaround, do not hotplug vCPUs to an active machine. 
Take the machine down on the hypervisor, change "vcpu" configuration, 
then bring the machine back online.

#### See also
* [Pitfalls of TSC Usage](http://oliveryang.net/2015/09/pitfalls-of-TSC-usage/)



# Maildrop

## Mailbot ignores DSN auto-replies

### Background

Mailbot, which is responsible for handling auto-replies in the vacation module of apnscp will not generate a response for certain messages. Mailbot is designed to ignore [delivery status notification](https://en.wikipedia.org/wiki/Bounce_message) emails in [check_dsn()](https://github.com/svarshavchik/courier-libs/blob/master/maildrop/mailbot.c) that contain an "Auto-Submitted" header.

### Solution

No workaround exists. It is recommended for email that requires an auto-response if a user is away to not include an "Auto-Submitted" DSN header.



# Laravel

## Facade usage

### Background

apnscp ships with Laravel 5.5 to provide framework for Horizon, a job dispatcher. apnscp conflicts with Laravel's facade accessors, namely Auth.

### Solution

Use literal facade classes in imports rather than relying on shorthand aliases.

```php
use Illuminate\Support\Facades\Route;
Route::get('/some/where', 'SomeController@index');
```

As opposed to

```php
use Route;
Route::get('/some/where', 'SomeController@index');
```

## Custom views aren't recognized

When first creating a new view hierarchy, be sure to rebuild Laravel's cache.

```bash
cd /usr/local/apnscp
./artisan config:cache
```





# SSL

## Let's Encrypt SSL issuance behind SiteLock fails

SiteLock includes a Javascript client test before whitelisting an IP address to access resources behind it. Both apnscp and its [PHP ACME client](https://github.com/kelunik/acme-client) - as well as the official ACME service - perform lightweight HTTP protocol checks without complete browser emulation, meaning it lacks Javascript, video playback, and CSS support that would add unnecessary complexity. Because the test can change and is predicated on having a full Javascript engine, apnscp cannot issue certificates when a site is behind SiteLock.



# vsftpd

## On chdir: Remote host has closed the connection

### Background

vsftpd uses [seccomp sandboxing](https://lwn.net/Articles/656307/) to improve security by reducing potential vectors in the kernel. Removing a user from the system can result in getpwnam() to fail in translating uid to username resulting in a crash. 

### Solution

seccomp filtering is disabled in vsftpd by adding `seccomp_sandbox=NO` to `/etc/vsftpd/vsftpd.conf`.

# Crontab

## Crontab fails

### Background

If permissions on crontab in /home/virtual/FILESYSTEMTEMPLATE/ssh/usr/bin/crontab change such that it loses its setuid bit, the following error is produced whenever a job is scheduled either via crontab from the terminal or via Dev > Task Scheduler:

>    failed to set cron contents for `someuser': /var/spool/cron/#tmp.server.name.XXXXMnchuR: Permission denied

### Solution

Restore the setuid bit on crontab:

```shell
chmod 4755 /home/virtual/FILESYSTEMTEMPLATE/ssh/usr/bin/crontab 
```

Then refresh the filesystem layer:

```shell
/sbin/service fsmount reload
```
# Licensing

## DCC

License is incompatible with apnscp. DCC may be installed on servers that are for personal use to further enhance spam detection in email.

```bash
rpm -ihv http://www6.atomicorp.com/channels/atomic/centos/7/x86_64/RPMS/dcc-1.3.158-5.el7.art.x86_64.rpm
/usr/local/apnscp/bin/scripts/yum-post.php install dcc siteinfo
nano /etc/mail/spamassassin/v310.pre
# Uncomment loadplugin Mail::SpamAssassin::Plugin::DCC
# Write-out file, exit nano
systemctl reload fsmount
systemctl spamassassin restart
```