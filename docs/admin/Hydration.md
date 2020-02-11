---
title: Image hydration
---

One of the most important aspects of apnscp is that its [installation mechanism](https://gitlab.com/apisnetworks/apnscp/tree/master/resources/playbooks) doubles as a platform integrity check, meaning that you can run the install over apnscp as many times as you want and only incorrect/missing configuration is altered. Over 12,000+ lines of Ansible yaml go into printing out an apnscp platform, and still it's far from complete.

But what we have now is an opportunity to perform a *complete install*, remove personally identifiable information generated at install time, then run the install again to fill in the gaps. This process is called **hydration**. A dehydrated (desiccated) image provides native protection against brute-force, but lacks the ability to login and manage sites until hydrated.

## Installation

Start with a vanilla install using the [customization tool](https://apnscp.com/#customize). Because we're building for a generalized install, remove the `whitelist_ip` directive that is autopopulated. The command below builds an image using CloudFlare for nameservers (`use_robust_dns`), MariaDB 10.3 (default), no built-in DNS support, rspamd as the preferred [spam filter](https://hq.apiscp.com/filtering-spam-with-rspamd/), PHP 7.3, and Postgres 11.

```bash
curl https://raw.githubusercontent.com/apisnetworks/apnscp-bootstrapper/master/bootstrap.sh | bash -s - -s use_robust_dns='true' -s dns_default_provider='null' -s spamfilter='rspamd' -s system_php_version='7.3' -s pgsql_version='11'
```

![img](https://hq.apiscp.com/content/images/2019/11/Untitled.png)Off to the races!

Once the initial reboot happens, login to the server and view installation. Installation will take between 1-2 hours depending upon machine performance. Anything north of 2 hours, be weary as it may indicate future poor performance from the machine.

```bash
tail -f /root/apnscp-bootstrapper.log
```

apnscp will resume installation if interrupted by failure and update the panel code prior to reattempting. Failures are rare, but if you encounter one send an email to help@apnscp.com with the following information for assistance.

```bash
grep -m1 -B10 failed= /root/apnscp-bootstrapper.log
```

![img](https://hq.apiscp.com/content/images/2019/11/image.png)Installation is complete!

## Breaking the machine

Following installation, we need to scrub some information that will be later regenerated. This will momentarily break the panel, but too highlights the magic of Ansible. For brevity any path that doesn't begin explicitly with a "/" is assumed to be relative to the apnscp install root, /usr/local/apnscp. *clean.sh* is a helper script to facilitate this task.

```bash
env CLEAN=1 sh /usr/local/apnscp/build/clean.sh
```

clean.sh removes or truncates a variety of components for use with regeneration. Among those features removed:

*❌ must be removed, ⚠️ is discretionary.*

#### Key/license data

- ❌ storage/certificates/* - remove all traces within the Let's Encrypt storage directory
- ❌ config/license.pem - apnscp license unique to the server. A trial license will be acquired on deployment
- ❌ /root/.composer - Composer certificate

#### temporary files

- ❌ storage/tmp/, /tmp/* - hopefully /tmp goes without saying
- ❌ /.socket/btmp, /.socket/wtmp - previous login data. We'll just truncate the records using `truncate` rather than remove to avoid conflict with tmpfiles
- ❌ storage/logs/*, /var/log/* - previous logs
- ❌ storage/constants.php - automatically generated on apnscp boot

#### credentials

- ❌ storage/opcenter/passwd - administrative credentials
- ❌ /root/.my.cnf - MySQL password
- ❌ /root/.pgpass - PostgreSQL password
- ❌ /etc/postfix/mailboxes.cf - Postfix credentials

#### platform-specific panel configuration

`config/custom/config.ini` may be removed. If customizations are required to config.ini, then at the minimum these values must be removed:

- ⚠️ [auth] => secret, unless in multi-panel installs behind a proxy (see [cp-proxy](https://github.com/apisnetworks/cp-proxy)). In multi-panel installs this must be the same.
- ❌ [dns] => proxy_ip4, proxy_ip6, my_ip4, my_ip6 - NAT-specific IP settings
- ⚠️ [dns] => uuid, server-specific identifier used to identify which server a domain is presently on
- ⚠️ [dns] => provider_key, provider_default = DNS default provider, contains special authentication data
- ⚠️ [dns] => authoritative_ns - imported from /etc/resolv.conf, may leave if using
- ❌ [letsencrypt] => additional_certs, appends the server hostname

#### config/ files

- ❌ db.yaml, contains specific database credentials. This will be regenerated on install
- ❌ httpd-custom.conf, apnscp configuration

#### server-specific IPs

- ❌ storage/opcenter/namebased_ip_addrs, storage/opcenter/namebased_ip6_addrs - namebased IP ranges for sites

#### previous installation records

- ❌ /root/.bash_history, previously executed commands
- ❌ /root/apnscp-bootstrapper.log, install log
- ❌ /root/license.*, previous licenses - note the current license is installed in config/license.pem. If this file is removed a trial license will be acquired on boot.

Let's bring it all together...

```bash
cd /usr/local/apnscp
rm -rf config/license.pem storage/logs/* storage/certificates/{data,accounts} storage/opcenter/{passwd,namebased_ip_addrs,namebased_ip6_addrs} config/httpd-custom.conf config/db.yaml config/custom/config.ini  storage/tmp/* /tmp/* /var/log/{messages,yum.log,vsftpd.log,secure,maillog} storage/constants.php /root/.bash_history /root/.{my.cnf,pgpass} /root/.composer /root/apnscp-bootstrapper.log /root/license.* 
truncate -s 0  /.socket/{wtmp,btmp}
cd /
sudo -u postgres dropuser root
```

And remove the Argos/Monit packages for now. These will be regenerated on install, including the unique password for the relay user. You may opt to keep 00-argos.conf for any platform-specific overrides.

```bash
rpm -e argos monit
```

## Packaging it up

Now the system is sufficiently broken, let's trigger Bootstrapper to run on boot as if it were a new install,

```bash
systemctl enable bootstrapper-resume
```

We also need to recreate the Bootstrap bootstrap, which is removed on successful installation. Without `/root/resume_apnscp_setup.sh`, the service won't fire.

```bash
cat <<- EOF > /root/resume_apnscp_setup.sh
cd /usr/local/apnscp/resources/playbooks && ANSIBLE_LOG_PATH="/root/apnscp-bootstrapper.log" \
      ANSIBLE_STDOUT_CALLBACK="default" APNSCP_APPLY_PENDING_MIGRATIONS=db \
  ansible-playbook bootstrap.yml && \
      rm -f /root/resume_apnscp_setup.sh
EOF
chmod 755 /root/resume_apnscp_setup.sh
```

At this point it's also a good time to edit `/root/apnscp-vars-runtime.yml` to add any personalization (such as email address) to pass on. Let's configure it for the expectation that the admin email for every install will be matt@apisnetworks.com and that every machine will be access from 1 IP, 1.2.3.4, so let's allow it to bypass protection from Rampart,

```bash
cat <<EOF > /root/apnscp-vars-runtime.yml
apnscp_admin_email: matt@apisnetworks.com
whitelist_ip: 1.2.3.4
EOF 
```

> For a list of all possible settings, check out `cpcmd -o yaml scope:get cp.bootstrapper`. Specify a role to learn more about role-specific settings, e.g. `cpcmd -o yaml scope:get cp.bootstrapper mail/rspamd`.

## Fin!

That's it! On first boot apnscp will scrub any changes to the platform, as well as process any code updates, before running the installer once again. It's a good idea during this time to set a new password for root,

```bash
passwd root
# enter new password
```

Better yet, disallow password-based logins and permit only public key authentication once everything is installed:

```bash
cpcmd scope:set system.sshd-pubkey-only true
```

Make sure you have a key generated for root otherwise you won't be able to login!

A prebuilt image on a fresh machine reduced installation time to a modest **8 minutes**, not bad! There's an [outstanding bug](https://github.com/dw/mitogen/issues/636) with [Mitogen](https://networkgenomics.com/ansible/), that once fixed, will blaze through installation time within 2 minutes.

# See also

- [Customizing apnscp](https://hq.apiscp.com/service-overrides/) (hq.apnscp.com)
- [How to setup SSH keys](https://www.liquidweb.com/kb/using-ssh-keys/) (Liquid Web)