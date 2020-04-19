# SMTP

SMTP provides outbound mail relaying for the server. This is typical low-hanging fruit for hackers and a frequent attack vector. ApisCP provides a few means to secure SMTP, including denying outbound SMTP access to any non-mail process. Direct SMTP access is a common technique used to circumvent mail logs and TCP sockets are anonymous, which can make tracking down the origin quite difficult. [StealRat](https://www.abuseat.org/cmsvuln.html) for example uses this technique.

All TCP communication locally to 25 or 587 must be authenticated to preserve an audit trail. This behavior can be toggled with Bootstrapper, set `postfix_relay_mynetworks` to `true`. Be warned that if the machine were compromised and an attacker connects to 127.0.0.1:25 to relay mail there is no direct means to infer which process created the rogue connections.

## Smart host support

A smart host relays all outbound email through a single hop. Smart hosts are helpful if the machine is behind a firewalled or restrictive address that may be present on [DNSBLs](https://en.wikipedia.org/wiki/DNSBL). Smart hosts are also helpful to filter all mail through another trusted source.

The smart host hop may be configured via `cpcmd scope:set mail.smart-host`.

`cpcmd scope:set mail.smart-host "'[mail.relay.com]:587'" someuser somepassword`

Likewise smart host support may be disabled by setting mail.smart-host to "false".

`cpcmd scope:set mail.smart-host false`

Watch out! If the next hop is bracketed, the brackets must be doubly quoted "'[some.place]'" to ensure it's not automatically parsed as an array. Brackets bypass additional MX lookups on the hostname.

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

## SRS forwards

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
