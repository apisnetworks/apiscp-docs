# Resource enforcement

## Storage

Storage is tracked using native quota facilities of the operating system. XFS and Ext4 [filesystems](Filesystem.md) are supported, which provide equivalent tracking abilities. This tracking facility is called a "quota". Quotas exist as **hard** and **soft**. 

An account may not exceed its **hard quota** whereas a **soft quota** disposition is at the discretion of the application: it may be simply advisory or fail.

File data is allocated in **blocks**. Each block is 4 KB. Files must always occupy the entire block size even if there is insufficient data to cover the 4 KB block. Thus a 7 KB file may appear as 7 KB on disk, but is charged for 8 KB of storage by the operating system.

::: details
`repquota -ua | sort -n --key=3` will show all files belonging to users ordered by size. Each number, with the exception of 0, is in KB and will always be perfectly divisible by the filesystem block size, 4 KB.
:::

::: tip
Storage quotas are controlled by *quota* service name in the *diskquota* [service class](Plans.md).
:::

### inode quotas

Before discussing inode quotas, let's talk about an inode. inodes provide metadata about files. They don't contain file data, but instead information about the file or directory or device. inodes have a fixed size, typically 256 or 512 bytes each. With XFS and cyclic redundancy checks - a blessing for ensuring data integrity - these inodes are always 512 bytes. Ext4 uses 256 byte inodes by default.

Large inode sizes means that more information about a file. File size, creation time, modification time, owner, group are mandatory attributes one would find in an inode. Additional attributes include access control lists, granular access rights to a file; extended attributes, arbitrary data about a file; and SELinux security contexts, used by a separate subsystem that defines unambiguous operational boundaries of a file. 

*File names are not included* in an inode, but instead a **dentry**, which is another storage block that contains information about what file names it contains as well as its inode structures. Each dentry is stored in multiples of 4 KB.

***Bringing this together:***

For a directory consisting of 2 files, a 4 KB and 7 KB file: the total size charged for these 3 storage items is 4 KB (directory) + 4 KB (file) + 8 KB (file). These would create 3 inodes that are not directly charged to the account's storage quota but are still stored in the filesystem responsible for approximately 1.5 KB of additional storage. These files would instead be charged to the **inode quota**.

:::tip
Inode quotas are controlled by *quota* service name in the *fquota* [service class](Plans.md).
:::

Doing some quick math, the maximum number of files a 40 GB would allow for is approximately 9,320,675 1 byte files - still quite a bit.  
![quota-inode minimums](./images/quota-inode-minimum.png)

::: details
A zero byte file doesn't generate a 4 KB block of file storage, but still generates an inode. This is why *1 byte* is intended instead of *0 bytes*.
:::

The maximum number of inodes on XFS is 2^64. The maximum number of Ext4 is 2^32. You could fill up an XFS server with 9.3 million 1 byte files every second for 62,000 years before reaching its limit!

Ext4 on the other hand wouldn't last 10 minutes, assuming you could find a process to generate 9.3 million files every second. 

In either situation you're liable to run out of storage before inodes. On XFS systems, 2^64 inodes would require 8,388,608 PB of storage. 

*If you're on XFS, don't worry counting inodes.* 


### XFS/Ext4 idiosyncrasies

On Ext4/Ext3 platforms, CAP_SYS_RESOURCE allows bypass of quota enforcement. XFS does not honor quota bypass if a user or process has CAP_SYS_RESOURCE capability set. Thus it is possible for services that require creation of a file and are either root or CAP_SYS_RESOURCE to fail upon creation of these files. Do not sgid or suid a directory that may cause an essential service to fail on boot if quotas prohibit it, such as Apache.

It is possible to disable quota enforcement on xfs while counting usage using `xfs_quota`:

```bash
# findmnt just resolves which block device /home/virtual resides on
xfs_quota -xc 'disable -ugv' "$(findmnt -n -o source --target /home/virtual)"
```

This affects quota enforcement globally, so use wisely. Likewise don't forget to enable,

```bash
xfs_quota -xc 'enable -ugv' "$(findmnt -n -o source --target /home/virtual)"
```

## Bandwidth

Bandwidth is tallied every night during logrotation. Logrotation runs via `/etc/cron.daily/logrotate`. Its start time may be adjusted using *cron.start-range* [Scope](Scopes.md). A secondary task, `bwcron.service` runs every night at 12 AM server time (see *system.timezone* Scope). Enforcement is carried out during this window. Disposition is configured by the **bandwidth** [Tuneable](Tuneables.md). The following table summarizes several options.

| Parameter  | Description                                                  |
| ---------- | ------------------------------------------------------------ |
| resolution | For archiving; bandwidth is rounded down and binned every n seconds. Smaller resolutions increase storage requirements. |
| stopgap    | Bandwidth stopgap expressed in percentage. 100 terminates a site when it's over allotted bandwidth. Default setting, 200, suspends the site when it has exceeded 200% its bandwidth. 95 would suspend a site when it's within 5% of its bandwidth quota. |
| notify     | Bandwidth notification threshold expressed in percentage. As a sanity check, bandwidth_notify <= bandwidth_stopgap. Setting 0 would effectively notify every night. |

An email is sent to the customer every night informing them of overage. This template located in `resources/views/email/bandwidth` may be customized using typical ApisCP [customization](Customizing.md) rules. 

## Memory

Memory is a misunderstood and complex topic. [linuxatemyram.com](https://www.linuxatemyram.com/) addresses many surface complaints with free memory in a healthy system that are unfounded. cgroup memory accounting doesn't stray from this complexity. Before discussing technical challenges in accounting (and CoW semantics), let's start with some basics.

```bash
# Set ceiling of 512 MB for all processes
EditDomain -c cgroup,memory=512 domain.com
```

A site may consume up to 512 MB of memory before the OOM killer is invoked.

::: tip
"OOM" is an initialism for "out of memory". Killer is... a killer. OOM killer is invoked by the kernel to judiciously terminate processes when it's out of memory either on the system or control group.
:::

## CPU

CPU utilization comes in two forms: user and system (real time is the sum of user + system). User time is spent incrementing over a loop, adding numbers, or templating a theme. System time is when a process communicates with the kernel directly to perform a privileged function, such as opening a file, forking a process, or communicating over a network socket.

In typical operation, user will always be an order of magnitude higher than system. `time` can help you understand how. Don't worry if it doesn't make sense yet, we'll walk through it.

```bash
strace -c -- /bin/sh -c 'time  (let SUM=0; for i in $(seq 1 1000) ; do SUM+=$i ; stat / > /dev/null; done)'

real    0m2.231s
user    0m0.777s
sys     0m1.336s
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- ----------------
 99.96    1.335815      667908         2         1 wait4
  0.01    0.000152          11        14           mmap
  0.01    0.000080          10         8           mprotect
  0.01    0.000073           9         8           open
  0.00    0.000049          12         4           read
  0.00    0.000031           4         8           close
  0.00    0.000029           2        16           rt_sigprocmask
  0.00    0.000024           3         7           fstat
  0.00    0.000024           2        10           rt_sigaction
  0.00    0.000022          11         2           munmap
  0.00    0.000016           3         5           brk
  0.00    0.000016          16         1           execve
  0.00    0.000011           6         2           stat
  0.00    0.000007           7         1         1 access
  0.00    0.000004           4         1           getrlimit
  0.00    0.000004           4         1           getpgrp
  0.00    0.000003           3         1           getpid
  0.00    0.000003           3         1           uname
  0.00    0.000003           3         1           getuid
  0.00    0.000003           3         1           getgid
  0.00    0.000003           3         1           geteuid
  0.00    0.000003           3         1           getegid
  0.00    0.000003           3         1           getppid
  0.00    0.000003           3         1           arch_prctl
  0.00    0.000000           0         1           rt_sigreturn
  0.00    0.000000           0         1           clone
------ ----------- ----------- --------- --------- ----------------
100.00    1.336381                   100         2 total
```

## Process

## IO
IO restrictions are classified by read and write. 

```bash
EditDomain -c cgroup,writebw=2 domain.com
# Apply the min of blkio,writebw/blkio,writeiops
# Both are equivalent assuming 4 KB blocks
EditDomain -c cgroup,writebw=2 -c blkio,writeiops=512 domain.com
```

IO and CPU weighting may be set via ioweight and cpuweight respectively. ioweight requires usage of the CFQ/BFQ IO elevators.

```bash
# Default weight is 100
# Halve IO priority, double CPU priority
EditDomain -c cgroup,ioweight=50 -c cgroup,cpuweight=200 domain.com
```




## Emergency stopgaps

## Troubleshooting

### Memory reported is different than application memory

cgroup reports all memory consumed within the OS by applications, which includes filesystem caches + network buffers. Cache can be automatically expunged when needed by the OS. To expunge the cache forcefully, write "1" to `/proc/sys/vm/drop_caches`. For example, working with "site1" or the first site created on the server:

```bash
cat /sys/fs/cgroup/memory/site1/memory.usage_in_bytes
# Value is total RSS + TCP buffer + FS cache
echo 1 > /proc/sys/vm/drop_caches
# Value is now RSS
cat /sys/fs/cgroup/memory/site1/memory.usage_in_bytes
```

This can be confirmed by examining `memory.stat` in the cgroup home. Likewise memory reported by a process may be higher than memory reported by cgroup, this is because cgroup only accounts for memory uniquely reserved by the application. A fork shares its parent's memory pages and copies-on-write at which point the newly claimed memory is charged to the cgroup.
