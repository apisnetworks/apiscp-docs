---
layout: docs
title: Errata
group: misc
---
{::options toc_levels="2..3" /}
{:toc}
* ToC 

## MySQL

### Cyclic InnoDB crash
#### Background
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

#### Solution
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