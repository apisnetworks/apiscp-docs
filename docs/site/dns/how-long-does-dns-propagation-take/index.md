---
title: "How long does DNS propagation take?"
date: "2014-10-28"
---

DNS propagation may take anywhere from 15 minutes to 24 hours. In rare circumstances, propagation may take longer.

Propagation begins once the [nameserver](https://kb.apnscp.com/dns/nameserver-settings/) settings are changed through the domain registrar, which is the company through which you purchased your domain name.

## Explanation

DNS maps a hostname, e.g. `apnscp.com` to an IP address, e.g. `64.22.68.1`. Mapping is resolved by a DNS server that returns an authoritative answer (_IP address_) along with a number, in seconds, for how long this answer is valid; it is called "time-to-live" or TTL. TTL values range anywhere from 15 minutes to 24 hours. A DNS response will linger in the resolver cache until _TTL seconds_ have expired at which point another query is issued for a fresh result.

Setting a lower TTL will reduce the delay of changing IP addresses by requiring the client to constantly request a domain name's DNS record. DNS queries can take anywhere between 2 ms to 50 ms depending upon load, network distance and congestion. This overhead is then added onto a page request thereby increasing the time required to load a web site.

For this reason, it is advisable to only reduce TTL to under 43200 (12 hours) if you anticipate making network changes to your domain's DNS (e.g. server migration) within the next 24-48 hours.

 

## See also

- KB: [How does DNS work?](https://kb.apnscp.com/dns/dns-work/)
