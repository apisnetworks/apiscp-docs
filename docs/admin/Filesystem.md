---
title: Filesystem
---

All accounts are located in a virtual filesystem located in `/home/virtual`. Each account is assigned a unique numeric ID and the base path is */home/virtual/siteXX* where XX is the assigned ID. For convenience, a symlink to the system group name and primary domain are created.

Each account filesystem is synthesized through a variety of layers using BoxFS, a solution [developed in 2010](https://updates.hostineer.com/2010/08/introducing-apollo-our-next-generation-platform/) to make multi-tenant management easier. BoxFS uses OverlayFS, a union filesystem that takes multiple layers and synthesizes them into 1 single layer.

![OverlayFS synthesis](./images/overlay-fs.png)

Technical details are discussed later. At a minimum it's important to know that BoxFS is composed at most 1 writeable layer and zero or more read-only layers. Any write a file on these lower read-only layers *forces* the file to *copy-up* to the writeable layer. `shadow` is the writeable layer in BoxFS.

## Components

### FILESYSTEMTEMPLATE

Services that have corresponding filesystem structures are installed under /home/virtual/FILESYSTEMTEMPLATE. Refer to [Filesystem template](#filesystem-template) section below for managing this component.

### fst

*fst* stands for “filesystem”, not to be confused with Filesystem Template (sometimes referred to as ***FST*** with capitalization) as discussed above. *fst* is the composite layer of all read-only system layers from *FILESYSTEMTEMPLATE/* plus the read-write data layer, *shadow/*.

### shadow

*shadow* contains all data written on the account. To see how much data an account is consuming, beyond querying quota (`quota -gv admin12`), which only yields non-system files, du -sh /home/virtual/site12/shadow would be suitable.

### info

*info* contains account and user metadata.

| Directory | Purpose                                                      |
| :-------- | :----------------------------------------------------------- |
| cur       | Current account configuration                                |
| new       | Pending account configuration during an account edit. See [Programming Guide](../PROGRAMMING.md#hooks). |
| old       | Previous account configuration during an account edit. See [Programming Guide](../PROGRAMMING.md#hooks). |
| services  | Filesystem services enabled on account which have a corresponding FILESYSTEMTEMPLATE presence. |
| users     | Per-user configuration.                                      |

## Filesystem template

**Filesystem Template** (“**FST**”) represents a collection of read-only layers shared among accounts named after each service enabled. The top-most layer that contains read-write client data is called the **Shadow Layer**. Services live in `/home/virtual/FILESYSTEMTEMPLATE` and are typically hardlinked against system libraries for consistency unless */home/virtual* and */* reside on different devices in which case each system file is duplicated.

### Adding packages

Filesystem replication is controlled by `yum-post.php`. All installed services are located in the system database in **site_packages**. New services may be installed using `scripts/yum-post.php install PACKAGE SERVICE` where *SERVICE* is a named service under `/home/virtual/FILESYSTEMTEMPLATE` and corresponds to an installed service module.

```bash
yum install -y sl
cd /usr/local/apnscp
./bin/scripts/yum-post.php install sl siteinfo
systemctl reload fsmount
su -c sl site1
# Choo choo!
```

#### Solving dependencies

Packages encode dependency information in their [RPM spec](https://rpm-packaging-guide.github.io/) file. `yum-post.php` can optionally follow these requirements, recursively installing corresponding packages.

```bash
./bin/scripts/yum-post.php depends vips
# WARNING : CLI\Yum\Synchronizer\Depends::run(): Package `vips' is not resolved. Install the following dependencies to resolve: ilmbase, OpenEXR-libs, ImageMagick6-libs, cfitsio, libexif, fftw-libs-double, gdk-pixbuf2, libgsf, hdf5, matio, openslide, orc, pango, poppler-glib, librsvg2, vips, libwebp7

# Install vips into siteinfo. "-d" installs dependencies as well
./bin/scripts/yum-post.php install -d vips siteinfo
```

::: tip Layer precedence
*siteinfo* is available to all sites. *ssh* is another layer available only if the account has terminal access (ssh,enabled=1). To restrict a package and its dependencies to the *ssh* layer, which includes *siteinfo*, change the above argument `siteinfo` to `ssh`.
:::

### Removing packages

`scripts/yum-post.php remove PACKAGE` is used to remove an installed package from the FST. `--soft` may be specified to remove a file from the database while persisting in FST.

```bash
./bin/scripts/yum-post.php remove sl
```

### Breaking links

A FST file may need to be physically separated from a system file when customizing your environment. For example, you may want to change `/etc/sudo.conf` in `/home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc` and keep it separate from the system sudo.conf that would be sourced when logging in as root.

- First, verify the file is linked:
  - `stat -c %h /home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc/sudo.conf`
  - *A value greater than 1 indicates a hardlink elsewhere, likely to its corresponding system path. This is only true for regular files. Directories cannot be hardlinked in most filesystems*
- Second, break the link:
  - `cp -dp /home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc/sudo.conf{,.new}`
  - `rm -f /home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc/sudo.conf`
  - `mv /home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc/sudo.conf{.new,}`
  - *sudo.conf has now had its hardlink broken and may be edited freely without affecting /etc/sudo.conf. Running stat again will reflect “1”.*

Restrictions can be applied automatically (see **Restricting file replication** below).

### Propagating changes

Once a file has been modified within the FST, it is necessary to recreate the composite filesystem. `systemctl reload fsmount` will dump all filesystem caches and rebuild the layers. Users logged into their accounts via terminal will need to logout and log back in to see changes.

### Restricting file replication

Restriction is done through `config/synchronizer.skiplist`. Modified system files, including user control files such as shadow, passwd, and group, are good candidates for inclusion into the skiplist. Each file listed may the literal filename or a glob-style pattern.

### Creating layers

ApisCP supports creating arbitrary filesystem layers, which are synthesized when a virtual account is brought online. Additional layers can be created by first creating a directory in `/home/virtual/FILESYSTEMTEMPLATE` that will serve as the service name. Install RPMs, which will be tracked by ApisCP or manually copy files, which are not tracked on RPM updates (if applicable) to the layer. Next, enable the layer on account by creating a file named after the layer in `siteXX/info/services`. Finally, rebuild the site to synthesize its layers.

```bash
# Install tmux RPM
yum install -y tmux
# Create a new layer, "sampleservice"
mkdir /home/virtual/FILESYTEMTEMPLATE/sampleservice
# Install tmux RPM into sampleservice; track installation
/usr/local/apnscp/bin/scripts/yum-post.php install tmux sampleservice
# Run tmux on login for all bash terminals
mkdir -p /home/virtual/FILESYSTEMTEMPLATE/sampleservice/etc/profile.d/
echo "tmux" > /home/virtual/FILESYSTEMTEMPLATE/sampleservice/etc/profile.d/tmux.sh
# Enable sampleservice on site1
# get_site_id <domain> will translate domain -> site
touch /home/virtual/site1/info/services/sampleservice
# Resynthesize layers
/etc/systemd/user/fsmount.init reload_site site1
```

::: tip
A more detailed example is available within [Site and Plan Management](Plans.md#complex-plan-usage) that applies this layer programmatically based on assigned plan.
:::

## Technical details

BoxFS uses OverlayFS, a union filesystem similar to AUFS and related to UnionFS. OverlayFS exhibits excellent performance over AUFS and is part of mainline kernel. OverlayFS partitions a filesystem into slices called layers. An overlay consists of a single read-write upper layer and zero or more read-only lower layers. Temporary file creation is backed by a physical work directory on a location not contained in upper or lower layers. All lower layers are immutable. Any files modified on these layers are immediately copied up to the upper layer, which is always `shadow/`. 

Upper layers may block lower level files from visibility by setting either the `opaque` xattr or per-file by creating a character device with major/minor 0 that has the same path.

Let's explore blocking out files and directories on `siteinfo` located in `/home/virtual/FILESYSTEMTEMPLATE` with a test account.  

```bash
AddDomain -c siteinfo,domain=test.test -c siteinfo,admin_user=testuser123 -c dns,enabled=0 -c mail,enabled=0 -c ssh,enabled=1
su testuser123@test.test -c 'cat /etc/profile'
```

We'll see the contents of `/etc/profile`, which is inherited from `/home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc/profile`. Checking the file inode confirms this.

```bash
stat -c "%i %n" /home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc/profile /home/virtual/test.test/etc/profile
```

/etc/profile is presently in read-only mode read from FST/siteinfo/etc/profile. Remove the file directly from the overlay layer.

```bash
rm -f /home/virtual/test.test/etc/profile
# A device is created on the upper directory
stat /home/virtual/$(get_site test.test)/shadow/etc/profile
#  File: ‘/home/virtual/site192/shadow/etc/profile’
#  Size: 0               Blocks: 0          IO Block: 4096   character special file
#Device: 801h/2049d      Inode: 2542036     Links: 1     Device type: 0,0
#Access: (0000/c---------)  Uid: (    0/    root)   Gid: (    0/    root)

# Now this file no longer exists
stat -c "%i %n" /home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc/profile /home/virtual/test.test/etc/profile
```

Remove the character device, flush filesystem cache by reloading fsmount service, then /etc/profile exists again.

```bash
rm -f /home/virtual/$(get_site test.test)/shadow/etc/profile
systemctl reload fsmount
stat -c "%i %n" /home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc/profile /home/virtual/test.test/etc/profile
```

Lastly manually blank the file out by creating a character device with 0 major/minor. Because we're operating directly on a lower layer, caches must be manually expunged.

```bash
mknod /home/virtual/$(get_site test.test)/shadow/etc/profile c 0 0
systemctl reload fsmount
stat -c "%i %n" /home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc/profile /home/virtual/test.test/etc/profile
```

Directories can be blanked out as well by setting the opaque property using xattrs.

```bash
yum install -y attr
getfattr -d -m - /home/virtual/$(get_site test.test)/shadow/etc
# file: home/virtual/site192/shadow/etc
# trusted.overlay.impure="y"
# trusted.overlay.origin=0sAPsdAAFnSCL/NEhD+Y0teKomOYfjsxwWAA+80kI=
ls -1 /home/virtual/test.test/etc/ | wc -l
```

OverlayFS attributes reside in the **trusted** section. xattrs support user, system, trusted, and security sections that are covered in detail in [xattr(7)](https://man7.org/linux/man-pages/man7/xattr.7.html).

```bash
setfattr -n trusted.overlay.opaque -v y /home/virtual/$(get_site test.test)/shadow/etc
systemctl fsmount reload
# Shows lower count
ls -1 /home/virtual/test.test/etc/ | wc -l
```

`/etc` now has files solely from shadow/ ignoring inheritance from siteinfo and ssh services. To clear the opaque behavior, change `trusted.overlay.opaque` to `n`.

```bash
setfattr -n trusted.overlay.opaque -v n /home/virtual/$(get_site test.test)/shadow/etc
systemctl fsmount reload
# Shows the same count as original
ls -1 /home/virtual/test.test/etc/ | wc -l
```

## Problems

### BoxFS references previous file inode

After updating the filesystem template via `systemctl reload fsmount`, inodes may not update until filesystem caches are dropped. Drop the filesystem dentry cache using option 2:

```bash
echo 2 > /proc/sys/vm/drop_caches
```

### Excessive inode counts on recycled sites

If a site is deleted, then added again through an [account wipe](https://kb.apnscp.com/control-panel/resetting-your-account/), it's possible for inode figures to be higher than what is reported through `du`.

To sum up the inode usage charged to an account, run

```bash
du --inode -s /home/virtual/siteXX/shadow
```

where *siteXX* is the [site identifier](CLI.md#get-site) of an account.

If the inode tally as reported in *fused* from `cpcmd -d siteXX site:get-account-quota` disagrees, then the kernel is holding some files in memory. Clear the cache by issuing,

```bash
echo 3 > /proc/sys/vm/drop_caches
```

In normal operation, this resolves itself automatically as caches are eventually expired by Linux's [VFS](https://www.usenix.org/legacy/publications/library/proceedings/usenix01/full_papers/kroeger/kroeger_html/node8.html).
