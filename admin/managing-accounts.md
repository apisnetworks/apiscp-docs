---
layout: docs
title: Managing Accounts
group: admin
name: intro
---

* ToC
{:toc}


# Command-Line Interface

## Adding Accounts

New accounts may be added from the terminal using `add_domain.sh`, which is an interactive dialog for creating new accounts. Accounts may also be added freeform using `AddDomain` that accepts multiple parameters, e.g. `AddDomain -c siteinfo,domain=example.com -c siteinfo,admin_user=example -c siteinfo,passwd=mypassword -c mysql,dbaseprefix=debug`. Any value not specified will inherit the plan default in `/etc/virtualhosting/plans/default`. Multiple accounts may be paired with an invoice number for multi-site management. It is recommended to designate one domain as a primary and all other domains as subordinate by specifying *billing,invoice=XX-YY* for the primary domain and *billing,parent_invoice=YY-ZZ* for the subordinates.

## Deleting Accounts

`DeleteDomain`  handles account removal. `DeleteDomain` accepts an unlimited number of arguments that must be of the form domain, site, or invoice.

## Suspending Accounts

Accounts may be suspended/unsuspended using `SuspendDomain QUALIFIER` where *QUALIFIER* is one of site number, invoice, or domain name. Accounts may be optionally paired with an invoice and suspended via invoice.

## Examples

```bash
# Create a domain named domain1.com
AddVirtDomain -c billing,invoice=SITE-111 -c siteinfo,admin_user=admin1 -c siteinfo,domain=domain1.com 	
# And another one named foobar.com
AddVirtDomain -c billing,invoice=SITE-111 -c siteinfo,admin_user=admin2 -c siteinfo,domain=foobar.com

suspend.sh domain1.com
suspend.sh site1
# Suspend all sites using billing invoice "SITE-111"
suspsend.sh SITE-111
```

## Hijacking Accounts

As root, you may override a user account to login using `temp_password DOMAIN`. A temporary password will be issued for 3 minutes allow you to login to the panel. Once the timer expires, the account password will be reset to its previously configured value. This may be repeated multiple times without resetting the original password; however, the 3 minute timer will not be reset.

## Command-line Utility
apnscp includes a command-line utility to interact with the panel called `cmd`. `cmd` accepts optional parameters -d and -u to impersonate a given domain and user. For example, to get the uptime as root: `cmd common_get_uptime`. 

To get the configured [admin email address](https://github.com/apisnetworks/apnscp-modules/blob/master/modules/common.php) for example.com, `cmd -d example.com common_get_admin_email`. 

To list files as user "secondary" on example.com in /tmp, use `cmd -d debug.com -u secondary file_get_directory_contents /tmp`. 

Arrays are encapsulated using brackets ("[]") and hashes notated with a colon (":"). To grant SELECT , INSERT, and DELETE privileges on database "foo" for user "secondary" connecting over localhost on the account example.com, the following command would be used: 

`cmd -d debug.com sql_set_mysql_privileges secondary localhost foo "[select:1,insert:1,delete:1]"`

# Filesystem Template
**Filesystem Template** ("FST") represents a collection of read-only layers shared among accounts named after each service enabled. The top-most layer that contains read-write client data is called the **Shadow Layer**. Services live in ``/home/virtual/FILESYSTEMTEMPLATE`` and are typically hardlinked against system libraries for consistency.

## Restricting Updates
Restriction is done through ```etc/synchronizer.skiplist```. Modified system files, including user control files such as shadow, passwd, and group, are good candidates for inclusion into the skiplist. 

> Any files shared via ```/.socket``` that are linked to from ```/usr``` as a symbolic link should be present in the skiplist to prevent yum-synchronizer from deleting the file on package update.

## Populating FST
An initial population is done using ``yum-synchronizer``. All installed services are located in the system database in "site_packages". New services may be installed using `yum-sychronizer install PACKAGE SERVICE` where *SERVICE* is a named service under `/home/virtual/FILESYSTEMTEMPLATE` and corresponds to an installed service module.

## Breaking Links
A FST file may need to be physically separated from a system file when customizing your environment. For example, you may want to change `/etc/sudo.conf` in `/home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc` and keep it separate from the system sudo.conf that would be sourced when logging in as root.
* First, verify the file is linked:
    * ```stat -c %h /home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc/sudo.conf```
    * *A value greater than 1 indicates a hardlink elsewhere, likely to its corresponding system path. This is only true for regular files. Directories cannot be hardlinked in most   filesystems*
* Second, break the link:
    * ```cp -dp /home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc/sudo.conf{,.new}```
    * ```rm -f /home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc/sudo.conf```
    * ```mv /home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc/sudo.conf{.new,}```
    * *sudo.conf has now had its hardlink broken and may be edited freely without affecting /etc/sudo.conf. Running stat again will reflect "1".*

## Propagating Changes
Once a file has been modified within the FST, it is necessary to recreate the composite filesystem. `service fsmount reload` will dump all filesystem caches and rebuild the layers. Users logged into their accounts via terminal will need to logout and log back in to see changes. 