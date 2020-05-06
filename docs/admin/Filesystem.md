---
title: Filesystem
---

All accounts are located in `/home/virtual`. Each account is assigned a unique numeric ID and the base path is */home/virtual/siteXX* where XX is the assigned ID. For convenience, a symlink to the system group name and primary domain are created.

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
| new       | Pending account configuration during an account edit. See [Programming Guide](https://docs.apiscp.com/development/programming-guide/#hooks). |
| old       | Previous account configuration during an account edit. See [Programming Guide](https://docs.apiscp.com/development/programming-guide/#hooks). |
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

## Problems

### BoxFS references previous file inode

After updating the filesystem template via `systemctl reload fsmount`, inodes may not update until filesystem caches are dropped. Drop the filesystem dentry cache using option 2:

```bash
echo 2 > /proc/sys/vm/drop_caches
```
