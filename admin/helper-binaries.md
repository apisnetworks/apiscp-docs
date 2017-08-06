---
layout: docs
title: Helper Binaries
group: admin
lead: An overview of helper binaries/functions bundled as part of apnscp.
---
* ToC
{:toc}
{::options toc_levels="2..3" /}

## Shell Built-ins
All shell built-ins are available via `/etc/profile.d/apnscp.sh`

### cmd

Run an apnscp method under an optionally user-defined role.

#### Examples

```bash
# As admin of example.com, get all bandwidth usage
cmd -d example.com bandwidth_get_all_composite_bandwidth_data
```

```bash
# Change password as user secondaryuser
cmd -d  example.com -u secondaryuser auth_change_password newrandompassword
```

```bash
# Automatically renew Let's Encrypt certificate for example.com as user admin
cmd pman_schedule_api_cmd_admin example.com "" letsencrypt_renew
# Alternatively:
cmd -d example.com letsencrypt_renew
```

### get_site

Get site name from domain. Same as "site" + `get_site_id` 

### get_site_id

Get internal site ID from domain. Returns 1 on failure otherwise 0.

#### Example

```bash
get_site_id example.com
[[ $? -ne 0 ]] && echo "example.com doesn't exist"
```
### fstresolve

Determine libraries linked against a binary. Used to resolve dependency problems when propagating a system package into the filesystem template.

#### Examples
```bash
fstresolve /home/virtual/FILESYSTEMTEMPLATE/siteinfo/usr/bin/ar
```

## apnscp Scripts
All apnscp scripts are available under `{{ site.data.paths.apnscp}}/bin/php/scripts`. All scripts make use of the apnscp CLI framework and require invocation with `apnscp_php` to operate.

### change_dns.php

### changelogparser.php

### reissueAllCertificates.php

### transfersite.php

### yum-post.php