# Resource enforcement

## Storage

Storage is tracked using native quota facilities of the operating system. XFS and Ext4 [filesystems](Filesystem.md) are supported, which provide equivalent tracking abilities. This tracking facility is called a "quota". Quotas exist as **hard** and **soft**. 

An account may not exceed its **hard quota** whereas a **soft quota** disposition is at the discretion of the application: it may be simply advisory or fail.

Files are allocated in **blocks**. Each block is 4 KB. Files must always occupy the entire block size even if there is insufficient data to cover the 4 KB block. Thus a 7 KB file may appear as 7 KB on disk, but is charged for 8 KB of storage by the operating system.

::: details
`repquota -ua | sort -n --key=3` will show all files belonging to users ordered by size. Each number, with the exception of 0, is in KB and will always be perfectly divisible by the filesystem block size, 4 KB.
:::

::: tip
Storage quotas are controlled by *quota* service name in the *diskquota* [service class](Plans.md).
:::

### inode quotas

Before discussing inode quotas, let's talk about an inode. inodes provide metadata about files. They don't contain file data, but instead information about the file or directory or device. inodes have a fixed size, typically 256 or 512 bytes each. With XFS and cyclic redundancy checks - a blessing for ensuring data integrity - these inodes are always 512 bytes. Ext4 uses 256 byte inodes by default.

Large inode sizes means that more information about a file. File size, creation time, modification time, owner, group are mandatory attributes one would find in an inode. Additional attributes include access control lists, granular access rights to a file; extended attributes, arbitrary data about a file; and SELinux security contexts, used by a separate subsystem that defines unambiguous operational boundaries of a file. 

*File names are not included* in an inode, but instead a **dentry**, which is another storage block that contains information about what file names it contains as well as its inode structures. Each dentry is another 4 KB.

***Bringing this together:***

For a directory consisting of 2 files, a 4 KB and 7 KB file: the total size charged for these 3 storage items is 4 KB (directory) + 4 KB (file) + 8 KB (file). These would create 3 inodes that are not directly charged to the account's storage quota but are still stored in the filesystem responsible for approximately 1.5 KB of additional storage. These files would instead be charged to the **inode quota**.

:::tip
Inode quotas are controlled by *quota* service name in the *fquota* [service class](Plans.md).
:::

Doing some quick math, the maximum number of files a 40 GB would allow for is approximately 9,320,675 1 byte files - still quite a bit. ![quota-inode minimums](./images/quota-inode-minimum.png)

::: details
A zero byte file doesn't generate a 4 KB block of file storage, but still generates an inode. This is why *1 byte* is intended instead of *0 bytes*.
:::

The maximum number of inodes on XFS is 2^64. The maximum number of Ext4 is 2^32. You could fill up an XFS server with 9.3 million 1 byte files every second for 62,000 years before reaching its limit!

Ext4 on the other hand wouldn't last 10 minutes, assuming you could find a process to generate 9.3 million files every second. 

In either situation you're liable to run out of storage before inodes. On XFS systems, 2^64 inodes would require 8,388,608 PB of storage. 

*If you're on XFS, don't worry counting inodes.* 


### XFS/Ext4 idiosyncrasies

On Ext4/Ext3 platforms, CAP_SYS_RESOURCE allows bypass of quota enforcement. XFS does not honor quota bypass if a user or process has CAP_SYS_RESOURCE capability set. Thus it is possible for services that require creation of a file and are either root or CAP_SYS_RESOURCE to fail upon creation of these files. Do not sgid or suid a directory that may cause an essential service to fail on boot if quotas prohibit it, such as Apache.

## Memory

## CPU

## Process

## Bandwidth

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
