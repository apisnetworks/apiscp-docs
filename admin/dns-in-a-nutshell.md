---
layout: docs
title: DNS Cheatsheet
group: admin
name: dns
lead: A crash course is understanding DNS and its applications.
---

* ToC
{:toc}

## Introduction
DNS is a way to map small parcels of data on the Internet,
much like what a phonebook does. Some phonebooks contain telephone 
numbers to names. Some phonebooks provide collections of 
services. Some phonebooks provide erroneous information too. DNS does all of that and more.

A DNS resolver looks up the record from a nameserver.
Nameservers are configured through the domain registrar, which is where a domain is registered and renewed. Nameservers come in at least sets of 2 in case one goes down. Examples look like,

* - ns1.apisnetworks.com
  - ns2.apisnetworks.com
* - eva.ns.cloudflare.com
  - matt.ns.cloudflare.com


* - ns1.google.com
  - ns2.google.com
  - ns3.google.com
  - ns4.google.com
  - ns5.google.com

And so on. By convention, nameservers are prefixed *ns\<digit\>.\<domain\>*, but they can be anything as with the Cloudflare example above.

## Record types

DNS contains over a hundred [record types](http://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#table-dns-parameters-2). Each record type provides a structured type of data storage (or data mapping). Common record types include:

- **A**. Maps a hostname to an IP address using IPv4. That IP address is a machine that you can send data to/from
- **AAAA**. Maps a hostname to an IPv6 address. Otherwise same as above.
- **CNAME**. Maps a hostname to another hostname, e.g. foo.google.com maps to bar.google.com. bar.google.com has an A record, which follows the above rules.
- **TXT**. Maps a hostname to a string literal.
- **MX**. Maps mail delivery for a hostname to another hostname.
- **SRV**. Maps a hostname to a complex service with hostname/port/weight/priority, for example [XMPP](https://wiki.xmpp.org/web/SRV_Records) chat protocols use this. Imagine an MX record on steroids. You can define port + weight in addition to priority.
- **PTR**. Maps an IP address back to a hostname (cf. A records)

It turns into a matter of finding a suitable storage type for the data you want to return. By convention, when sending email, an MX record is queried to find out where to deliver email. If connecting to a website, it might be an A, AAAA, or even CNAME - but whichever it may be it must map back to an IP address to connect to send data. Only A and AAAA provide such mapping. (*CNAME maps hostname to hostname...*)

There are also novel usages, such as using a real-time DNS blacklist ("DNSRBL"). For example, mail servers can perform a DNS lookup on a connecting machine against a DNSRBL, such as [SpamCop](https://en.wikipedia.org/wiki/SpamCop). An A lookup requires the least bandwidth of all record types and SpamCop can encode a status whether the IP address is clean or a spammer, and more importantly why it's a spammer. It's sent over the wire as "1", "2", "3", etc which gets translated into an IP address as 127.0.0.1, 127.0.0.2 allowing the mail server to permit or deny the machine from connecting to deliver email.

Another exotic usage comes from a professional whose organization used DNS to manage inventory SKUs. By treating the numeric SKU as an IP address (*includes 1 to 4294967296 when rendered natively as a 32-bit unsigned integer*) and looking up a PTR record on the SKU, the system could map the SKU to a product name. Novel, but maybe not always practical!

## Anatomy of a DNS Response

DNS lookups consists of question sent to the authoritative nameserver. A question is comprised of both a query and the resource record type, for example:

* 1.68.22.64.in-addr.arpa IN PTR
* 64.22.68.1 IN A
* apnscp.com. IN MX 

{% callout info %}
"IN" in this context means Internet class. When DNS spec was initially created, it accommodated room for other classes such as Chaos ("CH") and [Hesiod](https://en.wikipedia.org/wiki/Hesiod_(name_service)) ("HS"). For this discussion, only the Internet class is relevant, but for completeness "IN" is included in the query/response examples.
{% endcallout %}

A DNS resolver, which is configured alongside network connectivity either dynamically as with DHCP or statically, is the first resolver by which a query (typically, hostname) is transformed into a DNS record with which a machine can work.

The resolver returns either an affirmative record (more on this later) or recursively queries until a saved copy is returned. 

> Think of DNS as a family tree. As the youngest, you want to know which parent fought in the Revolutionary War. Let's imagine too your family is full of immortal vampires who happen to have [anterograde memory loss](https://en.wikipedia.org/wiki/Anterograde_amnesia) past age 18. In order to figure out which parent served, it works as:
>
> Child (Miss) > Parent (Miss) > Grandparent (Miss) > Great grandparent (Miss) > Great great grandparent (Hit)
>
> The great great grandparent knows; it was himself. He has the lead bullets to prove it.  Now, because this family has an obtuse way of relaying information, it passes back through the chain:
>
> Child (Saved) < Parent (Saved) < Grandparent (Saved) < Great grandparent (Saved) < Great great grandparent (Known)
>
> Consequently, because it's now known across the lineage, as long as the history is remembered, there's no need to ask the great great grandparent for the fact. DNS works the same way, except the duration for which information is retained is dictated by the time-to-live ("TTL") value that is bundled with every DNS result. TTL values can range anywhere from 1 second to 604800 seconds (1 week) or even longer. So long as the time between when the record was requested and current time is less than the TTL, the saved information will be returned.



## Tracing DNS

DNS works recursively. Because of this trait, we can trace a request as it flows from the [root servers](https://en.wikipedia.org/wiki/Root_name_server) down to nameservers. 



First, there are two important things to know:

**Root nameservers** are a collection of 13 nameservers distributed across the world. With network sorcery, the actual physical number of root nameservers is much higher through [anycast](https://en.wikipedia.org/wiki/Anycast) routing (632 servers as of October 2016). These nameservers are named A through M and provide the next server in the resolver chain. In the below example, the root nameservers are the first record, 

```
.                       77407   IN      NS      a.root-servers.net.
.                       77407   IN      NS      b.root-servers.net.
.                       77407   IN      NS      c.root-servers.net.
```
{% callout info %}
Note the **period** ("."). This is a second important peculiarity of DNS. Each leg of resolving a DNS record is separated by a period. "*apnscp.com*" is more correctly represented as "*apnscp.com.*". This is true for every DNS record lookup; a period is required but implicitly added by DNS clients, because it's a cumbersome, pedantic nuance that would otherwise break DNS, including web browsing, for everyone. Imagine having to type in https://google.com./ every time instead of https://google.com/ in order to access Google.
{% endcallout %}

The right-most period ("apnscp.com**.**") returns the root servers whose IP addresses are hard-coded into into the DNS resolver (8.8.8.8 in the below example). Next, the DNS resolver queries "**com.**" at a random root nameserver (for example, b.root-servers.net.). 
```
com.                    172800  IN      NS      c.gtld-servers.net.
com.                    172800  IN      NS      h.gtld-servers.net.
com.                    172800  IN      NS      e.gtld-servers.net.
;; Received 488 bytes from 192.33.4.12#53(192.33.4.12) in 2378 ms
```
Using the same recursive pattern, **apnscp.com.** is asked from a random nameserver in the group c, h, and e.gtld-servers.net.

```
apnscp.com.             172800  IN      NS      ns1.apisnetworks.com.
apnscp.com.             172800  IN      NS      ns2.apisnetworks.com.
;; Received 109 bytes from 192.12.94.30#53(192.12.94.30) in 464 ms
```
e.gltd-servers.net. returns ns1.apisnetworks.com and ns2.apisnetworks.com as having the record for apnscp.com. Lastly, we query ns2.apisnetworks.com to resolve the record for apnscp.com.

```
apnscp.com.             86400   IN      A       64.22.68.10
apnscp.com.             86400   IN      NS      ns2.apisnetworks.com.
apnscp.com.             86400   IN      NS      ns1.apisnetworks.com.
;; Received 125 bytes from 96.126.122.82#53(96.126.122.82) in 46 ms
```

We've reached the end of the line and now have a record to maps apnscp.com to an IP address ("A" resource record).

You can try for yourself by running the following command from the shell. The final IP address may change, but overall will result in a similar recursive strategy to map apnscp.com to an IP address.

```bash
dig @8.8.8.8 +trace apnscp.com
```
One last note, you might wonder how c, h, and e.gtld-servers.net. know that apnscp.com is delegated to ns1.apisnetworks.com and ns2.apisnetworks.com? That's what happens when you set nameservers for a domain through a domain registrar such as GoDaddy or Namecheap. These companies interface directly with those nameservers to set NS records on those nameservers whenever a change is made through the domain registrar.



## Manipulating DNS

Knowing that DNS works recursively, what happens if a link in the chain breaks? Everything below it fails if the final response is not known yet. If the response is known, nothing happens. This is the power of **TTL** (time-to-live) and also why a low TTL can also be harmful as evidenced in a massive Dyn [denial of service attack](https://krebsonsecurity.com/2016/10/ddos-on-dyn-impacts-twitter-spotify-reddit) in 2016 that offlined such behemoths as Twitter, Spotify, and Reddit. Having a high TTL allows a site to continue to be reachable in case DNS fails. Having a low TTL requires a DNS to refresh constantly.

Why would you want a record to constantly refresh? If you have servers that may be unstable or as a denial of service sink. Typically a DoS attacks just an IP address trying to flood the target with as much data in as short a time as possible. Being able to swap out several expendable [reverse proxies](https://en.wikipedia.org/wiki/Reverse_proxy) that receive and drop traffic (sink) while normal clients obey DNS protocol allows sites under a deluge of malicious traffic to operate. This is, on a rough scale, how CloudFlare and other DDoS solutions operate by rotating out "hot" sinks.

If you anticipate changing servers or DNS records then, 

