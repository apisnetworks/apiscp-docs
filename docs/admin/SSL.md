# SSL

SSL is provided through [Let's Encrypt](https://letsencrypt.org), a free domain-validated SSL service. ApisCP v3.1 implements ACME v2 protocol, which supports both domain and wildcard SSL certificates as well as DNS, HTTP, and ALPN validation methods. ALPN is not used as a challenge method at this time.

## Initial setup

ApisCP will attempt to request SSL for the server at install time. A resolvable hostname and valid email address are necessary to register with Let's Encrypt. ApisCP does not provide a method to bootstrap DNS for a server at installation. If SSL cannot be acquired at install time, a self-signed certificate is used in the interim.

### Configuration checklist

The following is a generalized checklist of prerequisites:

* Configured admin email
  *Confirm with:* `cpcmd common:get-email`
  *Set with*: `cpcmd common:set-email user@domain.com`
* Admin email domain has resolvable MX record
  *Confirm with:* `dig +short MX domain.com`
* Resolvable DNS
  *Confirm with:* `dig +short "$(hostname)"`
  *Set with:* `cpcmd scope:set net.hostname some.host.name`
  *Unless:* DNS for hostname pending setup (see below)

### Bootstrapping server SSL with a hosted domain

Consider the scenario in which the server hostname is `svr1.mydomain.com` and DNS has not been configured yet. As a **prerequisite**, email has been set for the admin above and a default [DNS provider](DNS.md) has been configured for the server.

Add the domain, then create a DNS record either from command-line or within the control panel via **DNS** > **DNS Manager**.

```bash
AddDomain -c siteinfo,domain=mydomain.com -c siteinfo,admin_user=someuser
cpcmd -d mydomain.com dns:add-record mydomain.com svr1 A "$(curl -s http://myip4.apiscp.com/)"
# If IPv6, use the following command:
cpcmd -d mydomain.com dns:add-record mydomain.com svr1 AAAA "$(curl -s http://myip4.apiscp.com/)"
# Restart ApisCP to attempt another SSL authorization from Let's Encrypt
systemctl restart apiscp
```

It may take up to 30 minutes for the negative cache TTL to expire due to a specification baked into SOA records (c.f. [RFC 2308](https://tools.ietf.org/html/rfc2308)).

### Issuance staging
Issuance may be staged, that is to say authorization generated using `letsencrypt:challenges()`, then solved at a later time using `letsencrypt:solve()`. Once solved, the a certificate may be ordered for the hostname using `letsencrypt:request()` using the pre-solved challenges as a shibboleth. 

```bash
cpcmd -d site1 letsencrypt:challenges '[*.mydomain.com,mydomain.com]'
# '*.mydomain.com':
#  -
#    domain: mydomain.com
#    status: pending
#    type: dns-01
#    url: 'https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/65182225/pZ_rOA'
#    token: y8SB_bt3yw-WgW9qpbsycaf5JohZJ2O4Mg5WttMXEPc
#    payload: y8SB_bt3yw-WgW9qpbsycaf5JohZJ2O4Mg5WttMXEPc.eBTzuQcWvH6qMui1h0LTUCEYFIbxlCTafdxpVRJU-KY
# mydomain.com:
#  -
#    domain: mydomain.com
#    status: pending
#    type: http-01
#    url: 'https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/65182226/P6I9wg'
#    token: JSauNS-u2QmqMZfnyljdbD9PTWF39-W7mMvBPuOf294
#    payload: JSauNS-u2QmqMZfnyljdbD9PTWF39-W7mMvBPuOf294.eBTzuQcWvH6qMui1h0LTUCEYFIbxlCTafdxpVRJU-KY
#  -
#    domain: mydomain.com
#    status: pending
#    type: dns-01
#    url: 'https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/65182226/DicfxQ'
#    token: JSauNS-u2QmqMZfnyljdbD9PTWF39-W7mMvBPuOf294
#    payload: JSauNS-u2QmqMZfnyljdbD9PTWF39-W7mMvBPuOf294.eBTzuQcWvH6qMui1h0LTUCEYFIbxlCTafdxpVRJU-KY
#  -
#    domain: mydomain.com
#    status: pending
#    type: tls-alpn-01
#    url: 'https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/65182226/rQVQPQ'
#    token: JSauNS-u2QmqMZfnyljdbD9PTWF39-W7mMvBPuOf294
#    payload: JSauNS-u2QmqMZfnyljdbD9PTWF39-W7mMvBPuOf294.eBTzuQcWvH6qMui1h0LTUCEYFIbxlCTafdxpVRJU-KY
```

Values returned are **raw values** sent verbatim by Let's Encrypt.

* **For DNS** verification, *payload* must be the sha256 digest base64-encoded as a TXT record named "_acme-challenge"
* **For HTTP** verification, *payload* must be stored verbatim in a URL reachable via `/.well-known/acme-challenge/TOKEN`

We'll walk through setting up both of these challenges in ApisCP.

#### Staging HTTP
HTTP staging checks a URI for the Let's Encrypt payload. In the above example, we'll need to create an accessible location named `/.well-known/acme-challenge/JSauNS-u2QmqMZfnyljdbD9PTWF39-W7mMvBPuOf294` on the domain, mydomain.com, with the *payload* contents `JSauNS-u2QmqMZfnyljdbD9PTWF39-W7mMvBPuOf294.eBTzuQcWvH6qMui1h0LTUCEYFIbxlCTafdxpVRJU-KY`.

```bash
mkdir -p /var/www/html/.well-known/acme-challenge
echo 'JSauNS-u2QmqMZfnyljdbD9PTWF39-W7mMvBPuOf294.eBTzuQcWvH6qMui1h0LTUCEYFIbxlCTafdxpVRJU-KY' > '/var/www/html/.well-known/acme-challenge/JSauNS-u2QmqMZfnyljdbD9PTWF39-W7mMvBPuOf294'
# Verify it's reachable
curl -H http://mydomain.com/.well-known/acme-challenge/JSauNS-u2QmqMZfnyljdbD9PTWF39-W7mMvBPuOf294
```

::: warning
`.well-known/` is often aliased to a general purpose system directory location. If the above curl request doesn't work, there's a good chance it's located somewhere else, e.g. /tmp/.well-known.
:::

#### Staging DNS
Wildcard SSL records must use DNS  to complete the challenge. To complete a DNS challenge, create a DNS TXT record named "\_acme\_challenge" on the hostname for which you're requesting DNS. \*.foo.com would require a record named "\_acme\_challenge.foo.com" as would a DNS challenge on foo.com.

Payload data must be the base64-encoded sha256 hash of *payload*. In the above example, this can be computed using basic shell scripts:

```bash
echo -n 'y8SB_bt3yw-WgW9qpbsycaf5JohZJ2O4Mg5WttMXEPc.eBTzuQcWvH6qMui1h0LTUCEYFIbxlCTafdxpVRJU-KY' | openssl dgst -binary -sha256 | openssl base64 | tr -d '=' | tr '+/' '-_' 
# Produces 'wA1Vss7jqjQ-FYQ3Jvs99ZWg9sg8Stafh6KjEjxY9J4'
```

Now take your payload and add a DNS record named\ _acme\_challenge.

```bash
# Specify "30" to use a 30 second TTL so the record isn't cached for long
cpcmd -d mydomain.com dns:add-record mydomain.com '' TXT 'wA1Vss7jqjQ-FYQ3Jvs99ZWg9sg8Stafh6KjEjxY9J4' 30
```

::: tip
DNS may take some time to propagate. This is due to propagation built into the protocol (TTL value). The [ApisCP KB](https://kb.apnscp.com/dns/dns-work/) covers propagation in greater detail.
:::

::: warning Mind the -n flag
`echo -n` omits a newline, which if not specified would calculate the hash of "string\n" instead of "string" producing two distinct hash values!
:::

#### Finalizing staging
Once challenges are setup, call `letsencrypt:solve(['*.mydomain.com':'dns','mydomain.com':'http'])`.

```bash
env DEBUG=1 cpcmd -d mydomain.com letsencrypt:solve "['*.mydomain.com':'dns','mydomain.com':'http']"
# DEBUG   : SSL challenge attempt: dns (*.mydomain.com)
# DEBUG   : SUCCESS! SSL challenge response: *.mydomain.com (dns) - VALID
# DEBUG   : SSL challenge attempt: http (mydomain.com)
# DEBUG   : SUCCESS! SSL challenge response: mydomain.com (http) - VALID
```
Then once all challenges are solved for the named set, `letsencrypt:request()` should be called with IP address checks disabled (second parameter),

```bash
cpcmd -d mydomain.com letsencrypt:request "['*.mydomain.com','mydomain.com']" false
DEBUG   : *.mydomain.com already resolved by dns
DEBUG   : mydomain.com already resolved by http
INFO    : reminder: only 5 duplicate certificates and 50 unique certificates may be issued per week per account
INFO    : reloading web server in 2 minutes, stay tuned!
----------------------------------------
MESSAGE SUMMARY
Reporter level: OK
INFO: reminder: only 5 duplicate certificates and 50 unique certificates may be issued per week per account
INFO: reloading web server in 2 minutes, stay tuned!
----------------------------------------
```

## Locations

The following table summarizes important locations pertaining to SSL infrastructure. Files are marked with a *.extension* whereas directories include a trailing forward-slash (*/*) for disambiguation.

All locations are prefixed **/etc/pki** unless noted.

| Location                                                     | Remarks                                                      |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| tls/certs/server.pem                                         | System certificate                                           |
| tls/ca-trust/source/anchors                                  | Location to inject additional certificates (see [Trusting self-signed certificates](#trusting-self-signed-certificates) below) |
| /usr/local/apnscp/storage/certificates/data/certs/ACME-SERVER | Let's Encrypt account certificates                           |
| siteXX/fst/etc/httpd/conf.d/                                 | Apache SSL certificates                                      |
| /etc/haproxy/ssl.d                                           | IMAP/POP3 SSL termination certificates (mirrors httpd/conf.d/) |

## Storage/issuance process

Certificates are stored under `/usr/local/apnscp/storage/certificates/data/certs/ACME-SERVER` where *ACME-SERVER* is the configured Let's Encrypt signing service (acme-v02.api.letsencrypt.org/directory typically in production). These certificates are read at panel boot as part of housekeeping to determine which certificates should be reissued. Reissuance is bracketed as 10 days before expiration and up to day of expiration. It may be altered via [letsencrypt] => lookahead_days and [letsencrypt] => lookbehind_days respectively.

```bash
# Begin renewing SSL certificates 20 days prior to expiration
cpcmd scope:set cp.config letsencrypt lookahead_days 20
# And up to 1 day after expiration
cpcmd scope:set cp.config letsencrypt lookbehind_days -1
```

Once a certificate order has completed, it is stored under ACME-SERVER/siteXX. The certificate is then copied into siteXX/fst/etc/httpd/conf/ssl.crt and ssl.key directories. Additionally, if haproxy is used for mail (when `cpcmd scope:get cp.config mail proxy` is "haproxy"), then a PEM is also copied as `/etc/haproxy/ssl.d/siteXX`.

A completed certificate resides in 3 places: Let's Encrypt storage in storage/certificates, Apache config in httpd/conf/ssl.{key,crt}, and haproxy (for SMTP/IMAP/POP3) in /etc/haproxy/ssl.d.

## Mass reissuance

ApisCP provides a script to facilitate mass reissuance of all installed certificates. This may be useful in situations where network connectivity prohibits automatic reissuance over an extended period governed by a lookaround range in config.ini. It accepts 1 argument, a directory to enumerate. By default, certificates are installed under *storage/certificates/data/certs/acme-v02.api.letsencrypt.org.directory*.

```bash
cd /usr/local/apnscp/
apnscp_php bin/scripts/reissueAllCertificates.php /usr/local/apnscp/storage/certificates/data/certs/acme-v02.api.letsencrypt.org.directory
```

## Troubleshooting

ApisCP provides an SSL debug mode in config.ini. Verbosity is increased that may help ferret out failures in reissuance. Let's assume the server is failing to issue; it can be easily extended on a per-site basis by adding `-d siteXX` or `-d domain.com` to cpcmd.

```bash
cpcmd scope:set cp.config letsencrypt debug true
cpcmd scope:set cp.debug true
systemctl restart apiscp
cpcmd letsencrypt:request '[svr1.domain.com]'
```

> `letsencrypt:renew` is a non-destructive command that attempts to renew an existing certificate without alteration. `letsencrypt:append` attempts to issue a new certificate while retaining existing SSL hostnames. `letsencrypt:request` overwrites the given hostname set with a new set of hostnames. A set is written as `'[domain1.com, domain2.com]'`.

Sample output from the command,

```bash
DEBUG: SSL challenge attempt: svr1.domain.com (http)
DEBUG: SSL: setting `p0ZAj9RvYFTpysM3jLKjLHOM0Xv4noYtxBTEsSKHTPQ.48DSxJ1RVTfoPH2qk0N-1YyEEzwW4tFQJbfJY-jRmAQ' in `/tmp/acme/.well-known/acme-challenge/p0ZAj9RvYFTpysM3jLKjLHOM0Xv4noYtxBTEsSKHTPQ'
DEBUG: http challenge failed: Challenge failed (response: {"type":"http-01","status":"invalid","error":{"type":"urn:ietf:params:acme:error:unauthorized","detail":"Invalid response from https:\/\/svr1.domain.com\/.well-known\/acme-challenge\/p0ZAj9RvYFTpysM3jLKjLHOM0Xv4noYtxBTEsSKHTPQ [64.22.68.70]: \"<!DOCTYPE HTML PUBLIC \\\"-\/\/IETF\/\/DTD HTML 2.0\/\/EN\\\">\\n<html><head>\\n<title>404 Not Found<\/title>\\n<\/head><body>\\n<h1>Not Found<\/h1>\\n<p\"","status":403},"url":"https:\/\/acme-staging-v02.api.letsencrypt.org\/acme\/chall-v3\/13971920\/JeF6GA","token":"p0ZAj9RvYFTpysM3jLKjLHOM0Xv4noYtxBTEsSKHTPQ","validationRecord":[{"url":"http:\/\/svr1.domain.com\/.well-known\/acme-challenge\/p0ZAj9RvYFTpysM3jLKjLHOM0Xv4noYtxBTEsSKHTPQ","hostname":"svr1.domain.com","port":"80","addressesResolved":["64.22.68.70"],"addressUsed":"64.22.68.70"},{"url":"https:\/\/svr1.domain.com\/.well-known\/acme-challenge\/p0ZAj9RvYFTpysM3jLKjLHOM0Xv4noYtxBTEsSKHTPQ","hostname":"svr1.domain.com","port":"443","addressesResolved":["64.22.68.70"],"addressUsed":"64.22.68.70"}]}).
DEBUG: SSL challenge attempt: svr1.domain.com (dns)
WARNING: Dns_Module::record_exists(): No hosting nameservers configured for `svr1.domain.com', cannot determine if record exists
ERROR: Dns_Module_Surrogate::__parse: Non-existent DNS record `_acme-challenge'
DEBUG: Setting DNS TXT record _acme-challenge.svr1.domain.com with value GuIW_r_cARFoVr35VItWGhfwpSxGCRbTKwFE6Z0PYrE
DEBUG: dns challenge failed: Challenge failed (response: {"type":"dns-01","status":"invalid","url":"https:\/\/acme-staging-v02.api.letsencrypt.org\/acme\/chall-v3\/13971920\/F0RMlg","token":"p0ZAj9RvYFTpysM3jLKjLHOM0Xv4noYtxBTEsSKHTPQ"}).

```

From the above debug log, a HTTP request to 64.22.68.70 failed to produce the challenge request. A quick verification confirms the server address differs from 64.22.68.70 resulting in a failure.

### Validating installed certificates

`openssl` is a utility that can quickly check SSL certificates for expiration and subject alternative names, which are used to confirm a SSL certificate's authenticity  when connecting securely to mail or HTTP.

| Service | Port |
| ------- | ---- |
| HTTPS   | 443  |
| SMTPS   | 465  |
| POP3S   | 995  |
| IMAPS   | 993  |

Typical usage is `openssl s_client -connect IP:PORT -servername HOSTNAME` where IP is the IP to connect (or server hostname), PORT from the above table, and HOSTNAME is the certificate to examine. HOSTNAME is crucial as it helps the server send the correct certificate at handshake.

For example, `openssl s_client -connect apiscp.com:993 -servername apiscp.com | openssl x509 -noout -fingerprint` and `openssl s_client -connect apiscp.com:993 -servername nexus.apiscp.com | openssl x509 -noout -fingerprint` return different fingerprints because different certificates are sent depending upon the servername parameter.

#### Checking expiration date

A certificate is only valid for the expiration dates it is authorized to serve. All times are in GMT.

`openssl s_client -connect apiscp.com:993 -servername apiscp.com | openssl x509 -noout -dates`

#### Checking SANs

SANs are all hostnames bound to a certificate. -text generates significant data, so filter out the noise using `grep`:

`openssl s_client -connect apiscp.com:993 -servername apiscp.com | openssl x509 -noout -text | grep 'DNS:'`

## Importing certificates

Let's Encrypt will work for most situations, simple SSL and wildcard SSL. Certificates automatically update 10 days in advance.

What if you want to install an EV (extended validation) certificate? Two options, programmatically via `cpcmd -d domain ssl:install` or you can do it the old fashioned way: move the key in `siteXX/fst/etc/httpd/conf/ssl.key/server.key`, CRT as `server.crt` in `ssl.crt/`, chain in `ssl.crt/bundle.crt`, then in `/etc/httpd/conf/siteXX.ssl/`, create a file named custom with:

```apache
SSLCertificateChainFile /home/virtual/siteXX/fst/etc/httpd/conf/ssl.crt/bundle.crt
```

Followed by a configuration rebuild and reload: `htrebuild && systemctl reload httpd`

Alternatively, the API method `ssl:install` does this automatically. Arguments are key file, certificate, and optional bundle:

```bash
cpcmd -d domain.com ssl:install "$(cat /path/to/server.key)" "$(cat /path/to/server.crt)" "$(cat /path/to/bundle.crt)"
```

SSL will activate in 2 minutes or less depending upon what *[httpd]* => *reload_delay* is set to in [config.ini](https://gitlab.com/apisnetworks/apnscp/blob/master/config/config.ini).

But a greater question exists, why bother with EV when [EV certificates are dead](https://www.troyhunt.com/extended-validation-certificates-are-really-really-dead/)?

## Trusting self-signed certificates

A self-signed certificate is a certificate requested by and signed by the same authority, which is also almost always an untrusted authority. In this case it would be a certificate generated and signed by the server and not Let's Encrypt, ZeroSSL, or any other trusted authority.

Self-signed certificates can be trusted by adding the certificate to `/etc/pki/ca-trust/source/anchors`, then running `update-ca-trust extract`, which in turn will update `/etc/pki/tls/certs/ca-bundle.crt`.

::: tip serverAuth key usage required
`extendedKeyUsage=serverAuth` must be specified when generating the self-signed certificate for it to be included in ca-bundle.crt otherwise the certificate is included in `ca-bundle.trust.crt`, which is not the default CA location.

**See also** [CA Cert are only added at ca-bundle-trust.crt](https://stackoverflow.com/questions/58725457/ca-cert-are-only-added-at-ca-bundle-trust-crt) (StackOverflow)
:::
