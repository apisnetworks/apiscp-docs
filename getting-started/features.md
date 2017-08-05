---
layout: docs
title: Features
group: admin
name: dns
---

* ToC
{:toc}

## API Companion, Beacon

[![Beacon](https://apisnetworks.com/images/beacon/beacon.png)](https://github.com/apisnetworks/beacon)

Beacon is a scripting companion for apnscp that interfaces its API. Any user role may use it. Whatever apnscp exposes to a given role, Beacon too can interact with. Refer to the [Beacon repository](https://github.com/apisnetworks/beacon) to get started.

## Filesystem Template

**Filesystem Template** ("FST") represents a collection of read-only layers shared among accounts named after each service enabled. The top-most layer that contains read-write client data is called the **Shadow Layer**. Services live in ``/home/virtual/FILESYSTEMTEMPLATE`` and are typically hardlinked against system libraries for consistency.

### Restricting Updates
Restriction is done through ```etc/synchronizer.skiplist```. Modified system files, including user control files such as shadow, passwd, and group, are good candidates for inclusion into the skiplist. 

> Any files shared via ```/.socket``` that are linked to from ```/usr``` as a symbolic link should be present in the skiplist to prevent yum-synchronizer from deleting the file on package update.

### Populating FST
An initial population is done using ``yum-synchronizer``. All installed services are located in the system database in "site_packages". New services may be installed using `yum-sychronizer install PACKAGE SERVICE` where *SERVICE* is a named service under `/home/virtual/FILESYSTEMTEMPLATE` and corresponds to an installed service module.

### Breaking Links
A FST file may need to be physically separated from a system file when customizing your environment. For example, you may want to change `/etc/sudo.conf` in `/home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc` and keep it separate from the system sudo.conf that would be sourced when logging in as root.
* First, verify the file is linked:
    * ```stat -c %h /home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc/sudo.conf```
    * *A value greater than 1 indicates a hardlink elsewhere, likely to its corresponding system path. This is only true for regular files. Directories cannot be hardlinked in most   filesystems*
* Second, break the link:
    * ```cp -dp /home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc/sudo.conf{,.new}```
    * ```rm -f /home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc/sudo.conf```
    * ```mv /home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc/sudo.conf{.new,}```
    * *sudo.conf has now had its hardlink broken and may be edited freely without affecting /etc/sudo.conf. Running stat again will reflect "1".*

### Propagating Changes
Once a file has been modified within the FST, it is necessary to recreate the composite filesystem. `service fsmount reload` will dump all filesystem caches and rebuild the layers. Users logged into their accounts via terminal will need to logout and log back in to see changes. 