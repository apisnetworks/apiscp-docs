---
title: Postfix
---

[Postfix](http://www.postfix.org) provides SMTP service for ApisCP. SMTP is typical low-hanging fruit for hackers and a frequent attack vector. ApisCP provides a few means to secure SMTP, including denying outbound SMTP access to any non-mail process. Direct SMTP access is a common technique used to circumvent mail logs and TCP sockets are anonymous, which can make tracking down the origin quite difficult. [StealRat](https://www.abuseat.org/cmsvuln.html) for example uses this technique.

All TCP communication locally to 25 or 587 must be authenticated to preserve an audit trail. This behavior can be toggled with Bootstrapper, set `postfix_relay_mynetworks` to `true`. Be warned that if the machine were compromised and an attacker connects to 127.0.0.1:25 to relay mail there is no direct means to infer which process created the rogue connections.

## Configuration

`postconf` is a tool to inspect Postfix configuration. Likewise, many adjustable parameters are available in [`mail/configure-postfix`](https://gitlab.com/apisnetworks/apnscp/-/blob/master/resources/playbooks/roles/mail/configure-postfix/defaults/main.yml) of [Bootstrapper](Bootstrapper.md). For example, to see the current value of `disable_vrfy_command`:

```bash
postconf disable_vrfy_command
# disable_vrfy_command = yes
```

All Postfix configuration is available under [postconf(5)](http://www.postfix.org/postconf.5.html).

::: warning Bootstrapper prevails
Be careful of using `postconf -o name=value` to adjust a value. Bootstrapper may overwrite this value! All overwrites are listed in [`vars/main.yml`](https://gitlab.com/apisnetworks/apnscp/-/blob/master/resources/playbooks/roles/mail/configure-postfix/vars/main.yml). `postfix_custom_config` is a special top-level variable that overrides Postfix configuration. See [Customizing.md](Customizing#postfix) for further information.
:::

## Smart host support

A smart host relays all outbound email through a single hop. Smart hosts are helpful if the machine is behind a firewalled or restrictive address that may be present on [DNSBLs](https://en.wikipedia.org/wiki/DNSBL). Smart hosts are also helpful to filter all mail through another trusted source.

The smart host hop may be configured via `cpcmd scope:set mail.smart-host`.

`cpcmd scope:set mail.smart-host "'[mail.relay.com]:587'" someuser somepassword`

Likewise smart host support may be disabled by setting mail.smart-host to "false".

`cpcmd scope:set mail.smart-host false`

Watch out! If the next hop is bracketed, the brackets must be doubly quoted "'[some.place]'" to ensure it's not automatically parsed as an array. Brackets bypass additional MX lookups on the hostname.

### Logging SASL username

Enabling authenticated SASL header allows any relay to track SMTP behavior on a user level. MailChannels, [for example](https://mailchannels.zendesk.com/hc/en-us/articles/200262640-Setting-up-for-Postfix), recommends enabling this feature for granular reputation.

```bash
cpcmd scope:set cp.bootstrapper postfix_add_sasl_auth_header true
upcp -sb mail/configure-postfix
```

Once enabled, the username used to authenticate is logged within the Received: header. Doing so will expose user accounts, so make sure the relay that uses this information likewise removes it from the header. When doing so, if [DKIM](rspamd.md#DKIM-signing) is used, Received headers should not be signed per [RFC 4871 § 5.1](https://datatracker.ietf.org/doc/html/rfc4871#section-5.1) as Received headers would ultimately be tampered. DKIM signing does not include the Received header by default.

### Secure authentication

ApisCP will determine the best authentication criteria using `mail.smart-host` Scope. You can adjust whether opportunistic TLS, required TLS, DANE, or no encryption is used by changing `postfix_smtp_tls_security_level`:

| Setting     | Description                                                  |
| ----------- | ------------------------------------------------------------ |
| encrypt     | Required TLS. Communication requires STARTTLS. Safe for sending credentials. |
| may         | Opportunistic TLS. Communicate in plain-text, but use TLS if server supports STARTTLS command. OK for sending credentials. |
| none        | Disable encryption on SMTP communication. Unsafe for sending credentials. |
| dane        | Acquire TLSA record to determine TLS policy. Fallback to "encrypt" if no suitable DNSSEC records exist. Fallback to "may" if no TLSA records exist. |
| dane-only   | Mandatory DANE. No fallback to "encrypt" or "may".           |
| fingerprint | Requires configuration of smtp_tls_fingerprint_cert_match. Implies "encrypt". |
| verify      | Required TLS with peer name validation. See "[Mandatory server certificate verification](http://www.postfix.org/TLS_README.html#client_tls_verify)". |
| secure      | Required TLS with peer name validation + DNSSEC validation. See "[Secure server certificate validation](http://www.postfix.org/TLS_README.html#client_tls_secure)". |

```bash
# require communication to be encrypted before *any* communication happens
cpcmd scope:set cp.bootstrapper postfix_smtp_tls_security_level encrypt
upcp -sb mail/configure-postfix
```

### MailChannels integration

Create a new password via mailchannels.net's Customer Console. *username* is the MailChannels Account ID. Use the mail.smart-host Scope to configure MailChannels in one step:

`cpcmd scope:set mail.smart-host smtp.mailchannels.net username somepassword`

All mail will relay through MailChannels now using the assigned credentials. SPF records may be altered by overriding the DNS template.

```bash
cd /usr/local/apnscp
install -D -m 644 resources/templates/dns/email.blade.php config/custom/resources/templates/dns/email.blade.php
```

Then replace the records created when mail is enabled for a domain. This example is syntactically identical to the default email.blade.php template *except for the TXT record*.

```php
{{--
        All records must not contain any indention. Validate the template with:
        cpcmd dns:validate-template TEMPLATE_NAME

        Note:
                - dns:validate-template respects provider-specific RR capabilities.
                - host records must include trailing period (foo.bar.com.)
                - IN class is required, but HS and CH may also be used
                - \Regex::DNS_AXFR_REC_DOMAIN is used for validation
                - $ips refers to mail server IPs
--}}
{!! ltrim(implode('.', [$subdomain, $zone]), '.') !!}. {!! $ttl !!} IN MX 10 mail.{{ $zone }}.
{!! ltrim(implode('.', [$subdomain, $zone]), '.') !!}. {!! $ttl !!} IN MX 20 mail.{{ $zone }}.
{!! ltrim(implode('.', [$subdomain, $zone]), '.') !!}. {!! $ttl !!} IN TXT "v=spf1 a mx include:relay.mailchannels.net ?all"
@foreach($ips as $ip)
@php $rr = false === strpos($ip, ':') ? 'A' : 'AAAA'; @endphp
@foreach(['mail','horde','roundcube'] as $mailsub)
{!! ltrim(implode('.', [$mailsub, $zone]), '.') !!}. {!! $ttl !!} IN {!! $rr !!} {!! $ip !!}
@endforeach
@endforeach

```

Restart ApisCP after making changes. Altering SPF records for other outbound filters follows the same SPF logic as with the above MailChannels.

## Alternative transports

ApisCP contains two transports named *oneshot* and *relaylim* that affect Postfix's retry behavior. Transports may be configured via /etc/postfix/transport (see [transport(5)](http://www.postfix.org/transport.5.html)).

### oneshot transport

Attempt to deliver the message once. If it fails, the message will not be retried.

### relaylim transport

Attempt to deliver email in serial. Postfix will deliver up to 20 messages concurrently per domain, which may trigger protective measures on the receiving MTA. Delivering in serial ensures that only 1 connection at a time is opened to the server.

### Example

via `/etc/postfix/transport`

```
# Send mail to Yahoo in serial
yahoo.com   relaylim:
# Attempt to send mail once to .ru ccTLDs
.ru   oneshot:
# error is a builtin, but used as an example for its utility
# Any mail to @example.com will be rejected as well as its subdomains
example.com  error:Bad domain!
.example.com error:Bad domain!
```

> After editing, run `postmap /etc/postfix/transport` to update the database.

## SRS

Sender rewriting scheme ("SRS") alters the envelope sender to match the intermediate forwarding server thus inhibiting an SPF violation on the sender's domain (qux.com).

```
Remote MTA (qux.com)       Forwarding MTA (bar.com)
+-----------------+    +--------------------------------+
| RP: quu@qux.com |    | RP: SRS=qux.com+quu@bar.com    |
| To: foo@bar.com +----> To: baz@bar.com                |
| Email created   |    | SRS rewrites return-path       |
+-----------------+    +--------------------------------+
                                       |
                                       |
                                       v
                       +--------------------------------+
                       | RP: SRS=quu+qux.com@bar.com    |
                       | To: fwd@server.com             |
                       | Delivered, DSN to bar.com      |
                       +--------------------------------+
                           Receiving MTA (server.com)
```

Without SRS a message from qux.com delivered to baz@bar.com that in turn forwards to fwd@server.com would possess the return-path of qux.com despite having been directly handed off by bar.com. DMARC and SPF challenges for qux.com would be assessed against bar.com thus denying delivery.

At this time any message that arrives from a remote MTA will be rewritten with SRS. Any message originating from the server (excludes transitory forwards) will not be rewritten.

### SRS address appears in From: field

Postfix employs a [cleanup](http://www.postfix.org/cleanup.8.html) daemon to insert missing headers into a message. *From:* is inferred from the *Return-Path:* header when absent, which is rewritten by SRS. A From: header may then come across as,

 From: srs0=daf/=pl=apiscp.com=postmaster@jib.apisnetworks.com (Apache)

This situation arises when the primary domain is *not authorized* to handle mail for the domain (via *Mail* > *Mail Routing* in the panel). Add a From: header in the message to resolve it, for example:

```php
mail('user@example.com', 'Subject Line', 'Email body', ['From' => 'help@apiscp.com']);
```

## DKIM signing

DKIM requires rspamd usage. See [rspamd.md](rspamd.md#DKIM-signing) for further information.

## Splitting delivery IPs

Postfix supports a [sender transport map](http://www.postfix.org/postconf.5.html#sender_dependent_default_transport_maps) that allows a different [transport](http://www.postfix.org/transport.5.html) to be configured by sender (domain or full email).

Assigning a delivery IP for a domain (or sender) requires [customizating](Customizing.md#postfix) master.cf.

Create a new service in `/etc/postfix/master.d` named `ip-relay.cf` with a new *smtp* service:

```
mydomain.com-out unix  -       -       n       -       -       smtp
        -o smtp_helo_name=mydomain.com
        -o smtp_bind_address=64.22.68.2
```

::: details
A new transport called `mydomain.com-out` is created that invokes the `smtp` process in Postfix to handle mail. Both `smtp_helo_name` and `smtp_bind_address` are overrode for this service. Any mail that passes through this transport will connect from 64.22.68.2 and identify itself during HELO as `mydomain.com`.
:::

Add a new sender transport in `/etc/postfix/sender_transport`. For all mail from @mydomain.com to send through this transport specify:

```
@mydomain mydomain.com-out:
```

Lastly run `postmap /etc/postfix/sender_transport` to recompile the map and `upcp -sb mail/configure-postfix` to update master.cf.

::: tip Site-specific overrides
Any override named `siteXX-NAME.cf` will be removed when the corresponding siteXX is removed from the server.
:::


## Troubleshooting

###  "TLS is required, but was not offered by host"
When sending mail to a domain, it may be rejected with the following delivery status notification indicating a problem with TLS used to encrypt the communication. It has been observed with @sbcglobal.net (Prodigy Internet) services to be a spurious error caused by a delayed DNSBL check *after* connection.

For example, consider the following debug attempt that opens a SMTP connection to 144.160.159.22 issuing a STARTTLS command to opportunistically encrypt the connection:

```bash
sudo -u postfix openssl s_client -connect 144.160.159.22:25 -starttls smtp -debug
```

```
220 flpd599.prodigy.net ESMTP Sendmail Inbound 8.15.2/8.15.2; Thu, 29 Oct 2020 09:53:18 -0700..

(0x17))

EHLO mail.example.com..

119 (0x77)) 250-flpd599.prodigy.net Hello X.Y.Z [X.Y.Z.108], pleased to meet you..250 ENHANCEDSTATUS
CODES..
(0xA))

STARTTLS..

122 (0x7A))

553 5.3.0 flpd599 DNSBL:RBL 521<X.Y.Z.108 > _is_blocked. For assistance forward this error to abuse_rbl@abuse-att.net..
```

In the above example it's clear a DNSBL verdict is reached after initializing a TLS session thus resulting in the spurious error.
