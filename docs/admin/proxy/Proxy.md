<p align="center">
    <img title="ApisCP Panel Proxy" src="https://apiscp.com/images/logo-inv.svg" />
</p>

ApisCP panel proxy provides a centralized login portal for all participating ApisCP nodes. Panel proxy
consists of three components: (1) reverse proxy **cp-proxy**, (2) aggregation client **cp-collect**, and 
(3) API service **cp-api**.

This is the reverse proxy service that directs requests to the proper server.

## Background

cp-proxy is a reverse proxy that allows coordination between multiple, similar applications in which the application will push a request to another server via 307 redirect to another server if the account resides elsewhere. cp-proxy doubles as a simple method of upgrading normal, unencrypted HTTP sessions to HTTPS by placing a performant SSL terminator in front of the proxy.

## Quickstart

The following quickstart assumes a DNS-only or dev-only server that will not host any sites. These free licenses may be requested via [my.apiscp.com](https.my.apiscp.com). A DNS-only machine may be provisioned on a 1 GB machine using the following install command.

```bash
curl https://raw.githubusercontent.com/apisnetworks/apiscp-bootstrapper/master/bootstrap.sh | bash -s - -s use_robust_dns='true' -s always_permit_panel_login='true' -s has_dns_only='true' -s has_low_memory='true' -s dns_default_provider='null' -s anyversion_node='true' -s system_hostname='cp.mydomain.com' -s apnscp_admin_email='blackhole@apiscp.com' -s php_enabled='true'
```
`anyversion_node` allows using a non-system Node version (v10) for cp-proxy. `apnscp_admin_email` and `system_hostname` are required to arm the server with a valid SSL certificate.

::: tip Low low-memory
ApisCP is intended to work on 2 GB machines, but low-memory mode allows it to work on 1 GB machines. Not all 1 GB machines are provisioned consistently causing discrepancy in available memory for the guest. Add `-s limit_memory_1gb=500` to reduce the minimum memory check to "500 MB".
:::

```bash
useradd -rms /sbin/nologin cp
cd /home/cp
sudo -u cp git clone https://github.com/apisnetworks/cp-proxy.git /home/cp/proxy
cp /home/cp/proxy/cp-proxy.sysconf /etc/sysconfig/cp-proxy
# Now is a good time to edit /etc/sysconfig/cp-proxy!
cp /home/cp/proxy/cp-proxy.service /etc/systemd/system
sudo -u cp /bin/bash -ic 'nvm install 10 ; cd /home/cp/proxy/ ; nvm exec npm install'
systemctl enable --now cp-proxy
```

Next connect Apache to it by modifying /etc/httpd/conf/httpd-custom.conf within the SSL VirtualHost container. 
Pagespeed is disabled, which is known to cause interference with assets.

```
<IfModule ssl_module>
        Listen 443        
        <VirtualHost 66.42.83.159:443 127.0.0.1:443 [::1]:443>
                ServerName cp.mydomain.com
                SSLEngine On
                RewriteEngine On
                RewriteOptions Inherit
                # --- Add below ---
                # Disable gzip compression
                <IfModule pagespeed_module>
                    ModPagespeed unplugged
                </IfModule>

                # Pass HTTPS status
                RequestHeader set X-Forwarded-Proto "https"
                # Add this line, note trailing /
                ProxyPass / http://localhost:8021/
                # And this line, note trailing /
                ProxyPassReverse / http://localhost:8021/
                # -^- Add above -^-
        </VirtualHost>
</IfModule>

```

Next, reconfigure ApisCP to listen on a private network for the cp-proxy service.

```bash
cpcmd scope:set cp.bootstrapper has_proxy_only true
cpcmd scope:set cp.bootstrapper cp_proxy_ip 127.0.0.1
# Regenerate httpd-custom.conf in ApisCP
env BSARGS="--extra-vars=force=yes" upcp -sb apnscp/bootstrap
```

Run `htrebuild`, then visit [https://cp.mydomain.com](https://cp.mydomain.com/). You're done!

---

By default, cp-proxy will read from [http://127.0.0.1:2082](http://127.0.0.1:2082/). On a DNS-server this hosts no domains, which requires configuration below to route.

## Configuration

All configuration must be changed in `config/custom/config.ini`. [cpcmd](https://docs.apiscp.com/admin/CLI/#cpcmd) provides a short-hand means of doing this, e.g.

```
cpcmd scope:set cp.config <SECTION> <NAME> <VALUE>
```

| Section | Name                 | Description                                                  | Sample Value                                        |
| ------- | -------------------- | ------------------------------------------------------------ | --------------------------------------------------- |
| auth    | secret               | Must be the same across *all* instances. Used to encrypt cookies. | ABCDEFGH                                            |
| auth    | server_format        | Optional format that appends a domain to the result of *server_query*. \<SERVER> is substituted with result from JSON query. | \<SERVER>.mydomain.com                               |
| auth    | server_key           | Must be the same across *all* instances. Key for extended domain metadata. | ABC12345                                            |
| auth    | server_query         | API location that cp-api resides on. | https://api.mydomain.com/                     |
| core    | http_trusted_forward | [cp-proxy](https://github.com/apisnetworks/cp-proxy) service IP address. | 1.2.3.4                                             |
| misc    | cp_proxy             | Control panel proxy endpoint that cp-proxy resides on.       | [https://cp.mydomain.com](https://cp.mydomain.com/) |
| misc	| sys_status	| Optional Cachet location for system status	| https://demo.cachethq.io/  |

For the lazy scholars, these values can be easily imported from an existing machine:

```bash
for i in auth,secret auth,server_format auth,server_key auth,server_query core,http_trusted_forward misc,cp_proxy, misc,sys_status ; do
	IFS=","
	set -- $i
	section=$1
	value=$2
	echo "cpcmd scope:set cp.config $section $value '$(cpcmd scope:get cp.config $section $value)'"
done
```
### Passing IP address

All requests pass `X-Forwarded-For`, which is the client address. Each ApisCP panel installation **must be configured** to trust the cp-proxy server's data. Failure to do so will result in incorrect brute-force protection applied via [Anvil](../SECURITY.md#remote-access) or worse, IP spoofing by a malicious actor.

On all instances that accept traffic from cp-proxy **besides cp-proxy**, set *[core]* => *http_trusted_forward* assuming cp-proxy has the IP address 1.2.3.4:

*`cp_proxy_ip` is a special setting in Bootstrapper that populates http_trusted_forward.*

```bash
cpcmd scope:set cp.bootstrapper cp_proxy_ip "1.2.3.4"
env BSARGS="--extra-vars=force=yes" upcp -sb apnscp/bootstrap
# Or alternatively
# cpcmd scope:set cp.config core http_trusted_forward "1.2.3.4"
#
# Then in /usr/local/apnscp/config/httpd-custom.conf, add:
#
# LoadModule remoteip_module sys/httpd/modules/mod_remoteip.so
# RemoteIPHeader X-Forwarded-For
# RemoteIPTrustedProxy 1.2.3.4
```

**On the cp-proxy instance**, set http_trusted_forward to 127.0.0.1:

```bash
cpcmd scope:set cp.bootstrapper has_proxy_only true
cpcmd scope:set cp.bootstrapper cp_proxy_ip 127.0.0.1
env BSARGS="--extra-vars=force=yes" upcp -sb apnscp/bootstrap
```

:::warning cp-proxy as a solitary service
Setting `http_trusted_forward` to 127.0.0.1 prevents spoofing from malicious actors when sending a bogus `X-Forwarded-For:` header. Setting `http_trusted_forward` to 1.2.3.4 without restricting public network access via `PrivateNetwork=yes` would allow an attacker to spoof their IP remotely from 1.2.3.4, or in other words allow a customer on your network to brute-force other machines. 

Keeping cp-proxy as a solitary service prevents such internal subterfuge.
:::

:::tip Improving security
systemd network isolation can be enabled to restrict intraserver communication to just the named services: mysql, postgresql, and cp-proxy.  Set proxy_intraserver_only=true in Bootstrapper, then run env BSARGS="--extra-vars=force=yes" upcp -sb apnscp/bootstrap. This makes an assumption that the API lookup does not reside on the same server ([auth] => server_query is different than local). If such a configuration were required, create a systemd override that adds httpd.service to JoinsNamespaceOf.
:::

### Billing compatibility

[WHMCS module](https://github.com/lhdev/apiscp-whmcs) passes the active client IP address as `X-Forwarded-For` for firewall checks. When using cp-proxy in conjunction with supported billing modules, it is necessary to add the billing server to the list of trusted forwards. Specifying a list of IP addresses, ApisCP will filter internal and external addresses.

```bash
# Assuming WHMCS is installed on 64.22.68.2
cpcmd scope:set cp.bootstrapper cp_proxy_ip '[127.0.0.1,64.22.68.2]'
env BSARGS="--extra-vars=force=yes" upcp -sb apnscp/bootstrap
```

### Adding SSL

In the above example, the panel inherits the primary SSL certificate. This is managed by ApisCP. To add a new hostname, augment *[letsencrypt]* => *additional_certs*. It's easy to do using the cp.config Scope:
```bash
cpcmd scope:get cp.config letsencrypt additional_certs
# Make a note of the certs, if any. Each certificate
# is separated by a comma, e.g. "mydomain.com,cp.mydomain.com" or "cp.mydomain.com"
cpcmd scope:set cp.config letsencrypt additional_certs "mydomainalias.com,cp.mydomain.com"
```
ApisCP will automatically restart and attempt to acquire an SSL certificate for `cp.mydomain.com` in addition to the pre-existing SSL alias, `mydomainalias.com`.

### cp-proxy configuration

All configuration is managed within `/etc/sysconfig/cp-proxy`. After making changes, activate the new configuration by restarting cp-proxy: `systemctl restart cp-proxy`.

- **CP_TARGET**: initial URL that is fetched, this should be a panel login portal
- **LISTEN_PORT**: port on which cp-proxy listens
- **LISTEN_ADDRESS**: IPv4/6 address on which cp-proxy listens
- **SECRET**: an alphanumeric salt used to encrypt session cookie. Generated randomly on service startup, which will expire existing sessions. Define this value if this behavior is undesired
- **STRICT_SSL**: enable peer verification of hostnames when connecting via SSL

### Multi-homed Hosts
When working in situations in which a server is multi-homed, ensure each IP is bound to the panel. With ApisCP this can be accomplished by specifying multiple VHost macros in `/usr/local/apnscp/config/httpd-custom.conf`:
```
ServerName myserver.com
Use VHost 64.22.68.12
Use VHost 64.22.68.13
```

### Different root domains

Proxy requires that all servers share the same root domain. For example, assuming proxy endpoint "cp.mydomain.com" and hosting servers,

- svr1.mydomain.com
- svr2.mydomain.com
- svr3.mydomain.hosting

Both "svr1" and "svr2" would be valid names added to [cp-collector](https://github.com/apisnetworks/cp-collector). "svr3" would be invalid because the TLD (*.hosting*) differs.

To work around this, add each differing domain to /etc/hosts or create DNS records under mydomain.com. For example, in `/etc/hosts` this would suffice:

```bash
echo "$(dig +short svr3.mydomain.hosting) svr3.mydomain.hosting" >> /etc/hosts
```

## Design

### Server layout

A caching HTTP accelerator like Varnish is recommended in front of the proxy to minimize requests that flow through to the proxy service. In my implementation, Apache sits in front for HTTP2 and TLS. Apache hits Varnish for static assets, then what is left flows to cp-proxy. cp-proxy serves from cp #1 by default.

```
                                               +---------+
                                           +--->  cp #1  |
                                           |   +---------+
+--------+    +---------+    +----------+  |
|        |    |         |    |          |  |   +---------+
| apache +----> varnish +----> cp proxy +------>  cp #2  |
|        |    |         |    |          |  |   +---------+
+--------+    +---------+    +----------+  |
                                           |   +---------+
                                           +--->  cp #3  |
                                               +---------+
```


### Login mechanism & server designation
A login should check if the account is resident on the server. If not resident, the request should be forwarded to the proper server as a 307 redirect issued. This `Location:` header is filtered from the response and its FQDN stored as a session cookie.

Each subsequent request sends the session cookie that includes the server name to the proxy.

### Bypassing reverse proxy
An application may include `no-proxy` header in its response. The Location will flow through in the response headers effectively allowing the session to break from the proxy. 
