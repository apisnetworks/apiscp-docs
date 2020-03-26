# Troubleshooting

## phpMyAdmin, phpPgAdmin, and other system-wide utilities do not load

On a fresh install, a user reported problems accessing /phpMyAdmin within the panel. Further, the server hostname, `server.mydomain.com`, shared its second-level domain with an account on the server, `domain.com`. Both `server.mydomain.com` and `domain.com` resolved to the same IP address, 129.19.16.12 and any subdomain created under `domain.com` worked as expected.

### Cause

 Multiple hostnames were specified for the public IP address in /etc/hosts.

```
[server /]$ cat /etc/hosts
127.0.0.1    localhost
129.19.16.12    vps12345.vps.ovh.ca    vps12345
129.19.16.12 server.mydomain.com
```

### Solution

Remove the default, erroneous hostname configured for the system. In this case it's `129.19.16.12    vps12345.vps.ovh.ca    vps12345`


## Quota ext4 vs xfs

On ext4/ext3 platforms, CAP_SYS_RESOURCE allows bypass of quota enforcement. xfs does not honor quota bypass if a user or process has CAP_SYS_RESOURCE capability set. Thus it is possible for services that require creation of a file and are either root or CAP_SYS_RESOURCE to fail upon creation of these files. Do not sgid or suid a directory that may cause an essential service to fail on boot if quotas prohibit it, such as Apache.
