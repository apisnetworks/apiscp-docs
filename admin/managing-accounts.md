---
layout: docs
title: Managing Accounts
group: admin
name: intro
lead: Adding, removing, editing domains, impersonating accounts, and managing the filesystem template.
---

* ToC
{:toc}

# Account Layout
All accounts are located in `{{ site.data.paths.virtual_home }}`. Each account is assigned a unique numeric ID and the base path is 
*{{site.data.paths.virtual_home}}/siteXX* where XX is the assigned ID. For convenience, a symlink to the system group name and primary domain are created. 

## FILESYSTEMTEMPLATE

{:.no_toc}
Services that have corresponding filesystem structures are installed under {{ site.data.paths.virtual_home }}/FILESYSTEMTEMPLATE. Refer to [Filesystem Template](#filesystem-template) section below for managing this component.

## fst
{:.no_toc}
*fst* stands for "filesystem", not to be confused with Filesystem Template as discussed above. *fst* is the composite layer of all read-only system layers from *FILESYSTEMTEMPLATE/* plus the read-write data layer, *shadow/*.

## shadow
{:.no_toc}
*shadow* contains all data written on the account. To see how much data an account is consuming, beyond querying quota (`quota -gv admin12`), which only yields non-system files, du -sh /home/virtual/site12/shadow would be suitable.

## info

{:.no_toc}
*info* contains account and user metadata.

{:.table .table-striped}

| Directory | Purpose                                  |
| --------- | ---------------------------------------- |
| cur       | Current account configuration            |
| new       | Pending account configuration during an account edit. See [Programming Guide]({% link development/programming-guide.md %}#hooks). |
| old       | Previous account configuration during an account edit. See [Programming Guide]({% link development/programming-guide.md %}#hooks). |
| services  | Filesystem services enabled on account which have a corresponding FILESYSTEMTEMPLATE presence. |
| users     | Per-user configuration.                  |

# Command-Line Interface

All actions are done through the server terminal. Linux and Mac OS have a built-in ssh client (called "ssh"). For Windows, [PuTTy](http://www.putty.org) (free) and [Token2Shell](https://www.microsoft.com/en-us/store/p/token2shell/9plm0mdlvgr5) ($10) are recommended.

## Adding Accounts

New accounts may be added from the terminal using `add_domain.sh` under `{{ site.data.paths.apnscp }}/bin/scripts`, which is an interactive dialog for creating new accounts. Accounts may also be added freeform using `AddDomain` that accepts multiple parameters, e.g. `AddDomain -c siteinfo,domain=example.com -c siteinfo,admin_user=example -c siteinfo,passwd=mypassword -c mysql,dbaseprefix=debug`. Any value not specified will inherit the plan default in `/etc/virtualhosting/plans/default`. Multiple accounts may be paired with an invoice number for multi-site management. It is recommended to designate one domain as a primary and all other domains as subordinate by specifying *billing,invoice=XX-YY* for the primary domain and *billing,parent_invoice=YY-ZZ* for the subordinates.

## Deleting Accounts

`DeleteDomain`  handles account removal. `DeleteDomain` accepts an unlimited number of arguments that must be of the form domain, site, or invoice.

## Suspending Accounts

Accounts may be suspended/unsuspended using `SuspendDomain QUALIFIER` where *QUALIFIER* is one of site number, invoice, or domain name. Accounts may be optionally paired with an invoice and suspended via invoice.

## Examples

```bash
# Create a domain named domain1.com
AddDomain -c billing,invoice=SITE-111 -c siteinfo,admin_user=admin1 -c siteinfo,domain=domain1.com 	
# And another one named foobar.com
AddDomain -c billing,invoice=SITE-111 -c siteinfo,admin_user=admin2 -c siteinfo,domain=foobar.com

SuspendDomain domain1.com
SuspendDomain site1
# Suspend all sites using billing invoice "SITE-111"
SuspendDomain SITE-111
```

## Hijacking Accounts

As root, you may override a user account to login using `temp_password DOMAIN`. A temporary password will be issued for 3 minutes allow you to login to the panel. Once the timer expires, the account password will be reset to its previously configured value. This may be repeated multiple times without resetting the original password; however, the 3 minute timer will not be reset.

# Command-line API Utility
apnscp includes a command-line utility to interact with the panel called `cmd`. `cmd` accepts optional parameters -d and -u to impersonate a given domain and user. For example, to get the uptime as root: `cmd common_get_uptime`. 

To get the configured [admin email address](https://github.com/apisnetworks/apnscp-modules/blob/master/modules/common.php) for example.com, `cmd -d example.com common_get_admin_email`. 

To list files as user "secondary" on example.com in /tmp, use `cmd -d debug.com -u secondary file_get_directory_contents /tmp`. 

Arrays are encapsulated using brackets ("[]") and hashes notated with a colon (":"). To grant SELECT , INSERT, and DELETE privileges on database "foo" for user "secondary" connecting over localhost on the account example.com, the following command would be used: 

`cmd -d debug.com sql_set_mysql_privileges secondary localhost foo "[select:1,insert:1,delete:1]"`

{% callout info %}
cmd provides the same functionality as Beacon, but does not require an API key to use nor the SOAP API to communicate.
{% endcallout %}

## Remote Command-line Utility

In addition to `cmd`, which is targeted for quick administrative tasks from terminal, apnscp provides an environment-agnostic client, [Beacon](https://github.com/apisnetworks/beacon) that interfaces the SOAP API through an HTTP transport.

```bash
beacon --key=$(cmd auth_create_api_key "Beacon API key") exec common_get_kernel_version
```

`--key` sets the client key and `cmd auth_create_api_key` creates an API key locally. Once a key is set, `--key` may be dropped such that,

```bash
beacon exec common_get_listening_ip_addr
```

# Filesystem Template
**Filesystem Template** ("FST") represents a collection of read-only layers shared among accounts named after each service enabled. The top-most layer that contains read-write client data is called the **Shadow Layer**. Services live in ``/home/virtual/FILESYSTEMTEMPLATE`` and are typically hardlinked against system libraries for consistency.

## Restricting Updates
Restriction is done through `config/synchronizer.skiplist`. Modified system files, including user control files such as shadow, passwd, and group, are good candidates for inclusion into the skiplist. 

> Any files shared via ```/.socket``` that are linked to from ```/usr``` as a symbolic link should be present in the skiplist to prevent yum-synchronizer from deleting the file on package update.

## Populating FST
An initial population is done using ``yum-synchronizer``. All installed services are located in the system database in "site_packages". New services may be installed using `yum-synchronizer install PACKAGE SERVICE` where *SERVICE* is a named service under `/home/virtual/FILESYSTEMTEMPLATE` and corresponds to an installed service module.

## Breaking Links
A FST file may need to be physically separated from a system file when customizing your environment. For example, you may want to change `/etc/sudo.conf` in `/home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc` and keep it separate from the system sudo.conf that would be sourced when logging in as root.
* First, verify the file is linked:
    * ```stat -c %h /home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc/sudo.conf```
    * *A value greater than 1 indicates a hardlink elsewhere, likely to its corresponding system path. This is only true for regular files. Directories cannot be hardlinked in most  filesystems*
* Second, break the link:
    * ```cp -dp /home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc/sudo.conf{,.new}```
    * ```rm -f /home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc/sudo.conf```
    * ```mv /home/virtual/FILESYSTEMTEMPLATE/siteinfo/etc/sudo.conf{.new,}```
    * *sudo.conf has now had its hardlink broken and may be edited freely without affecting /etc/sudo.conf. Running stat again will reflect "1".*

## Propagating Changes
Once a file has been modified within the FST, it is necessary to recreate the composite filesystem. `service fsmount reload` will dump all filesystem caches and rebuild the layers. Users logged into their accounts via terminal will need to logout and log back in to see changes. 

## Creating layers

apnscp supports creating arbitrary filesystem layers, which are synthesized when a virtual account is brought online. Additional layers can be created by first creating a directory in `/home/virtual/FILESYSTEMTEMPLATE` that will serve as the service name. Install RPMs, which will be tracked by apnscp or manually copy files, which are not tracked on RPM updates (if applicable) to the layer. Next, enable the layer on account by creating a file named after the layer in `siteXX/info/services`. Finally, rebuild the site to synthesize its layers.

```bash
# Install tmux RPM
yum install -y tmux
# Create a new layer, "sampleservice"
mkdir /home/virtual/FILESYTEMTEMPLATE/sampleservice
# Install tmux RPM into sampleservice; track installation
/usr/local/apnscp/bin/scripts/install_fs_pkg.sh tmux sampleservice
# Run tmux on login for all bash terminals
mkdir -p /home/virtual/FILESYSTEMTEMPLATE/sampleservice/etc/profile.d/
echo "tmux" > /home/virtual/FILESYSTEMTEMPLATE/sampleservice/etc/profile.d/tmux.sh
# Enable sampleservice on site1
# get_site_id <domain> will translate domain -> site
touch /home/virtual/site1/info/services/sampleservice
# Resynthesize layers
service fsmount reload_site site1
```

Layers will be dynamically created on system startup. Programmatically enabling services is provided in the Programming Guide **@TODO**

# Built-in Checks

## Domain ownership

Before a domain may be added on as an addon domain, apnscp will verify that the domain uses the proper nameservers or that the IP address matches the account IP address. Domains that do not use the configured nameservers (**[dns]** => **hosting_ns**) must pass 1 of 3 challenges, by present in the bypass, or the feature must be disabled.

### Challenge modes

1.  Change nameservers to nameservers provided in **[dns]** => **hosting_ns**. Because of how [DNS caches]({% link admin/dns-in-a-nutshell.md %}) operate, this may take up to 24 hours to propagate once changed.
2.  Upload a random file to the current hosting provider that contains the same random name in the file.
3.  Create an A record named "newacct" through the current DNS provider that resolves back to the server. This should carry a 5 minute delay at most if "newacct" did not already exist.

Completing any of the above will allow the domain to be added.

### Bypass file

To bypass challenges for a specific domain, create a file named `{{ site.data.paths.opcenter }}/dnsbypass` with the domain name. Each line must contain only the domain name. If found, no challenges will be assessed upon adding the domain and upon completion, will remove the domain from the list.

### Disabling validation

{% callout danger %}

Disabling validation in instances where more than 1 user has access to the control panel is dangerous! Any domain added to the control panel also has mail authority for the domain. Thus, by adding a domain "gmail.com" and creating a catch-all email in **Mail** > **Manage Mailboxes**, the user now has the ability to redirect all email destined to gmail.com to her local inbox.

{% endcallout %}

Notification whenever a domain is added is *strongly encouraged* when validation is disabled. To generate notifications, enable **[domains]** => **notify**. To disable challenges, change **[domains]** => **dns_check** to false