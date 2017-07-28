# Introduction

## History

apnscp began in 2003 as a series of patches to Ensim WEBppliance to address insufficiencies or bugs in the design; there were plenty of bugs to uncover. Gradually I began overwriting apps in Ensim, including its dashboard as a means to differentiate Apis Networks from competition. By 2007 the project had grown into a full-time endeavor producing its own platform and [replacing](https://updates.hostineer.com/2007/01/v4-platform-release/) Ensim entirely. apnscp (**Ap**is **N**etwork**s** **C**ontrol **P**anel ) had become the de facto control panel for clients. Multi-tenant Ruby was introduced in 2014 with Python following in 2015 and Node in 2016. By mid-2016 work was well underway to take apnscp public.

![apnscp-1.0-2-2004](images\apnscp-1.0-2-2004.png)

![ssl-ensim1](images\ssl-ensim1.gif)

## Shared vs Virtual

Shared hosting aggregates all accounts onto 1 logical instance. A virtualized instance, through VPS, isolates logical instances into virtual instance. Virtual hosting is nothing more than shared hosting with root. You are sharing CPU (vCPU), memory ([memory compaction](https://lwn.net/Articles/368869/)/[ksm](http://www.linux-kvm.org/page/KSM)), network ports ([SR-IOV](https://en.wikipedia.org/wiki/Single-root_input/output_virtualization)) - even storage ([thin provisioning](http://www.linux-kvm.org/images/7/77/2012-forum-thin-provisioning.pdf)) - among several other neighbors except you don't know how many neighbors nor how much they are consuming. To expound upon this concept:

> Imagine you have an orange. This is 1 "instance" or "machine" or "cpu". It's whatever you deem it to be. Now, conceptualize slicing it with a knife. Each orange slice is *1/x* of the original orange. Now, take each orange slice and dole it out to *n* customers. This is virtualization. To each customer, it's a piece of orange. To the orange grower, however, it is a portion of the orange.
>
> Virtualized hosting works much in the same manner. You take a physical piece of hardware, slice it *n* ways and dole it out to customers. Each machine reports load average and run [queue depth](https://en.wikipedia.org/wiki/Run_queue) relative to itself making traditional shared hosting markers meaningless. Virtualized hosting renders 2 viable metrics: steal % and load average. Both are only meaningful if you have another server running an *identical* workload with which to compare. Without such pairing, these numbers are meaningless. If you are within good fortune to implement load balancing and possess 2 machines with an identical workload, here's what they can tell you:
>
> First, **steal%** is the amount of CPU time requested to the hypervisor (physical machine) on a virtualized instance that the hypervisor does not immediately address. Remember, your CPU is virtualized too, so before it can communicate with the physical CPU, it must go through the hypervisor. It's not uncommon on heavy workloads to see a 2-4% steal%. Anything higher than 10% is problematic as 10% of the time a parcel of work is stalled waiting on the CPU to respond. Second is the **load average** (*run queue depth*). A load average tells you how many processes are running on the machine at any given moment. A load average should be no higher than the number of cores on a machine (`grep processor /proc/cpuinfo | wc -l`). If either value is higher than reasonable limits (10.0 for steal% or greater-than *number cores* for load), congestion will occur. Typically load induces steal%. If steal% is high and load low, then you have a congested, oversold hypervisor. 
>
> `iostat 1` is the simplest way to measure both metrics from your terminal.

Because machines vie for processing time among neighboring guests, performance can fluctuate throughout the day. In order to deliver a consistent performance, it's important to minimize the amount of CPU wasted on ancillary tasks, such as brute-force attempts or bots. It is also important to note that the faster a request can be served the less likely another concurrent request would create a resource contention either in accessing same regions of memory or for the web server to spawn another connection slot to handle the request.

## With root comes great responsibility

Virtual hosting undoubtedly provides greater flexibility than traditional shared hosting environments; however it comes with a downside, you are now your own sysadmin. You know, a sysadmin - the guys you never hear about until *something* goes wrong. Even with their bountiful experience, sometimes they - speaking from personal experience - can encounter eclectic scenarios that not even they know how to address.  Sysadmins are the unsung heroes who enable business to flow. Work in a large firm and hardly know your sysadmin? Congratulate him; he's doing an excellent job.

apnscp is not a replacement to a sysadmin nor can it carry out all of the tasks and troubleshooting a sysadmin can, but it does obviate many traditional roles with user management, system hardening, and preventing unwanted intruders. It's a platform we have built for over 15 years with an expectation that I or you can take a vacation and not worry about a mishap shutting down service.

# Features

apnscp works best with at least 2 GB for services + caching. Additional features may be installed:

| Service  | ?           | Bottleneck  | Description                              |
| -------- | ----------- | ----------- | ---------------------------------------- |
| apnscp   | Required    | -           | Control panel frontend/backend           |
| mcache   | Recommended | Memory      | PHP opcode + session in-memory           |
| vscanner | Optional    | CPU         | Real-time upload filtering, well-known URI lockdown |
| mscanner | Optional    | Memory, CPU | Mail scanning, aggregate Bayesian DB     |
| rampart  | Recommended | CPU         | Real-time brute-force deterrent, DoS filtering |
| argos    | Recommended | CPU         | Monit monitoring profiles + push notification |


## Proactive and Reactive Monitoring

<<<<<<< HEAD
Argos is a configured Monit instance designed to afford both proactive and reactive monitoring. Rampart provides a denial-of-service sieve for reducing resource swells from misbehaving bots. apnscp includes disallowance of HTTP/1.0 protocol, by default, to reduce malware. All components work to keep your sites more secure by filtering out garbage. [tuned](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/6/html/Power_Management_Guide/Tuned.html) works proactively by retuning system variables as necessary. apnscp ships with the `virtual-guest` profile active.
=======
Birdhound is a configured Monit instance designed to afford both proactive and reactive monitoring. Rampart provides a denial-of-service sieve for reducing resource swells from misbehaving bots. apnscp includes disallowance of HTTP/1.0 protocol, by default, to reduce malware. All components work to keep your sites more secure by filtering out garbage. [tuned](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/6/html/Power_Management_Guide/Tuned.html) works proactively by retuning system variables as necessary. apnscp ships with the `virtual-guest` profile active.
>>>>>>> 9e7fb7dbdf021c9249de6c723aa8c7c8d5af3223

# Installation

apnscp may be installed from the bootstrap utility. Once installed a 15-day trial begins. A license key may be purchased through [apnscp.com](https://apnscp.com). 

Before installing, ensure the following conditions are met:

<<<<<<< HEAD
- [ ] 1 GB RAM (2 GB recommended)
=======
- [ ] 1 GB RAM
>>>>>>> 9e7fb7dbdf021c9249de6c723aa8c7c8d5af3223
- [ ] [Forward-confirmed reverse DNS](https://en.wikipedia.org/wiki/Forward-confirmed_reverse_DNS), i.e. 64.22.68.1 <-> apnscp.com
- [ ] CentOS 7.x or RedHat 7.x

## Bootstrapping apnscp

Run the command from terminal

```shell
wget -O - https://apnscp.com/bootstrap.sh | bash
```

The bootstrapper will install itself, as well as request a SSL certificate from Let's Encrypt (FCRDNS requirement). Once setup, a password will be generated. Your admin username is "admin" and password listed at the end.

## First Login

Visit https://<domain>:2083 to login to the panel as "admin". This is the **Administrator** account that can add, delete, and suspend accounts. **Site Administrators** are administrators of accounts created by an Administrator and are conferred all the rights of a **Secondary User**, with the added benefit of adding on domain, creating databases, and limited sudo. Further service configuration profiles may be setup in the following sections.

# Configuration
apnscp configuration is managed through `conf/` within its installation directory, `/usr/local/apnscp` by default. Two files require configuration before usage:
* database.yaml - cp, platform, and plugin database configuration
* auth.yaml - miscellaneous authentication providers

## Authentication Providers
apnscp uses a variety of third-party modules to enhance its presentation. The following providers are integrated and recommended that you setup an account with each to enhance your experience:
* Twilio: SMS notifications
* MaxMind: GeoIP location for unauthorized login notices
* PushOver: push notifications of server events to phone



## Initial Startup
apnscp will attempt to bootstrap SSL on first run using Let's Encrypt. To do this, the machine name must be reachable. Additional certificate names may be configured in conf/config.ini. Each time `additional_certs` is changed, remove the server SSL directory `data/ssl/account/MAIN` then restart apnscpd, `service apnscpd restart`. A new certificate will be fetched and installed within a couple minutes.

### Changing SSL Hostnames
Additional hostnames beyond the machine name (`uname -n`) can be configured by editing letsencrypt -> additional_certs in config.ini. To activate changes, remove the directory `vendor/data/acme-client/accounts/live/MAIN`, then restart apnscpd, `service apnscpd restart`.

### Adding Sites

Sites may be added using `AddDomain` or in simpler form, `add_site.sh`. Advanced usage of `AddDomain` is covered under **Managing Accounts**

# Logging In

apnscp may be accessed via https://<server>:2083/ or via http://<server>/ - an automatic redirect will occur in this situation. apnscp may be accessed from an addon domain through the /cpadmin alias.

### Important Terms

Before 

# Command-Line Interface

### Adding Accounts

New accounts may be added from the terminal using `add_domain.sh`, which is an interactive dialog for creating new accounts. Accounts may also be added freeform using `AddDomain` that accepts multiple parameters, e.g. `AddDomain -c siteinfo,domain=example.com -c siteinfo,admin_user=example -c siteinfo,passwd=mypassword -c mysql,dbaseprefix=debug`. Any value not specified will inherit the plan default in `/etc/virtualhosting/plans/default`. Multiple accounts may be paired with an invoice number for multi-site management. It is recommended to designate one domain as a primary and all other domains as subordinate by specifying *billing,invoice=XX-YY* for the primary domain and *billing,parent_invoice=YY-ZZ* for the subordinates.

### Deleting Accounts

`DeleteDomain`  handles account removal. DeleteDomain accepts an unlimited number of arguments that must be of the form domain, site, or invoice.

### Suspending Accounts

Accounts may be suspended/unsuspended using `SuspendDomain QUALIFIER` where *QUALIFIER* is one of site number, invoice, or domain name. Accounts may be optionally paired with an invoice and suspended via invoice.

## Examples

```bash
# Create a domain named domain1.com
AddVirtDomain -c billing,invoice=SITE-111 -c siteinfo,admin_user=admin1 -c siteinfo,domain=domain1.com 	
# And another one named foobar.com
AddVirtDomain -c billing,invoice=SITE-111 -c siteinfo,admin_user=admin2 -c siteinfo,domain=foobar.com

suspend.sh domain1.com

```



### Hijacking Accounts

As root, you may override a user account to login using `temp_password DOMAIN`. A temporary password will be issued for 3 minutes allow you to login to the panel. Once the timer expires, the account password will be reset to its previously configured value. This may be repeated multiple times without resetting the original password; however, the 3 minute timer will not be reset.

### Command-line Utility
apnscp includes a command-line utility to interact with the panel called `cmd`. `cmd` accepts optional parameters -d and -u to impersonate a given domain and user. For example, to get the uptime as root: `cmd common_get_uptime`. To get the configured [admin email address](https://github.com/apisnetworks/apnscp-modules/blob/master/modules/common.php) for example.com, `cmd -d example.com common_get_admin_email`. To list files as user "secondary" on example.com in /tmp, the use `cmd -d debug.com -u secondary file_get_directory_contents /tmp`. 

Arrays are encapsulated using brackets ("[]") and hashes notated with a colon (":"). To grant SELECT , INSERT, and DELETE privileges on database "foo" for user "secondary" connecting over localhost on the account example.com, the following command would be used: `cmd -d debug.com sql_set_mysql_privileges secondary localhost foo "[select:1,insert:1,delete:1]"`

## Apache
### Fallback Interpreter
Apache runs as an ISAPI module embedded into PHP instead of PHP-FPM to reduce request latency and achieve higher throughput. Having only 1 interpreter limits legacy applications, but legacy applications should be shunned rather than shoehorned into a production environment. A secondary fallback interpreter, usually 1 or 2 versions lower is available on port 9000. 

* To enable fallback support for a given domain or site, use the apnscp command driver, cmd:
  `cmd -d <domain> php_enable_fallback`
* To disable fallback support, use disable_fallback:
  `cmd -d <domain> php_disable_fallback`

#### Configuring Fallbacks
Additional fallbacks may be configured by duplicating httpd-fallback-common.conf

# Features

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

# Customizing

See **Programming Guide**.

# License

Unless otherwise specified, all components of apnscp and its subcomponents are (c) 2017 Apis Networks. All rights reserved. For licensing inquiries, contact license@apisnetworks.com