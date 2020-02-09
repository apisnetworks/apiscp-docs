---
title: Glossary
alias: glossary
---

[Account metadata]
: *Metadata* about an account that resides in *siteXX/info*. Examples of metadata include the primary domain, admin username, bandwidth allotment

{:#Bandwidth}
: Amount of transfer (inbound and outbound) that an account registers over a period. Bandwidth is in bytes unless a *unit* prefix is specified.

{:#Billing invoice}
: an identifier that relates an account or set of accounts to a common billing entity. Billing invoices are stored in billing,invoice account metadata.

{:#Byte}
: An indivisible unit comprised of 8 bits.

{:#Command-line}
: Direct server access accessed over terminal. SSH and embedded terminal (KVM) are used to access this mode.

{:#Metadata}
: data about data. A common example of this is account metadata that lives in siteXX/info for each account.

{:#siteXX}
: An expression that refers to /home/virtual/siteXX where siteXX is the *site identifier* of an account.

{:#Site identifier}
: internal marker for sites, which is defined on account creation. Site identifier index begins at 1 and the next largest value is assigned. Site identifiers do not change unless the account is deleted, then recreated. Examples: site12, site1, site999999999. Site identifiers may be determined by domain using `get_site_id domain.com` from the command-line.

{:#Site ID identifier}
: numeric component of the *Site identifier*.

{:#Unit}
: A measurement quantity. "Bytes" are the most common unit referenced. 