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

`DeleteDomain`  handles account removal. DeleteDomain accepts an unlimited number of arguments that must be of the form domain, site, or invoice.

## Suspending Accounts

Accounts may be suspended/unsuspended using `SuspendDomain QUALIFIER` where *QUALIFIER* is one of site number, invoice, or domain name. Accounts may be optionally paired with an invoice and suspended via invoice.

## Examples

```bash
# Create a domain named domain1.com
AddVirtDomain -c billing,invoice=SITE-111 -c siteinfo,admin_user=admin1 -c siteinfo,domain=domain1.com 	
# And another one named foobar.com
AddVirtDomain -c billing,invoice=SITE-111 -c siteinfo,admin_user=admin2 -c siteinfo,domain=foobar.com

suspend.sh domain1.com

```

## Hijacking Accounts

As root, you may override a user account to login using `temp_password DOMAIN`. A temporary password will be issued for 3 minutes allow you to login to the panel. Once the timer expires, the account password will be reset to its previously configured value. This may be repeated multiple times without resetting the original password; however, the 3 minute timer will not be reset.

## Command-line Utility
apnscp includes a command-line utility to interact with the panel called `cmd`. `cmd` accepts optional parameters -d and -u to impersonate a given domain and user. For example, to get the uptime as root: `cmd common_get_uptime`. 

To get the configured [admin email address](https://github.com/apisnetworks/apnscp-modules/blob/master/modules/common.php) for example.com, `cmd -d example.com common_get_admin_email`. 

To list files as user "secondary" on example.com in /tmp, use `cmd -d debug.com -u secondary file_get_directory_contents /tmp`. 

Arrays are encapsulated using brackets ("[]") and hashes notated with a colon (":"). To grant SELECT , INSERT, and DELETE privileges on database "foo" for user "secondary" connecting over localhost on the account example.com, the following command would be used: 

`cmd -d debug.com sql_set_mysql_privileges secondary localhost foo "[select:1,insert:1,delete:1]"`
