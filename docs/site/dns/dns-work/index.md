---
title: "How does DNS work?"
date: "2015-03-29"
---

## Overview

DNS maps a hostname (comprised of a domain name + optional subdomain, e.g. example.com or www.example.com) to an addressable machine (by IP address) somewhere on the Internet. DNS works by issuing multiple queries, recursively, until the machine address is resolved.

## Process

### Initial query

Of a most trivial example, let's assume a browser accesses http://example.com for the first time. Because this is the first time the hostname has been accessed, a full lookup must complete:

- (0 ms) browser queries local DNS resolver (on same computer) where example.com is
    - local DNS responds with a negative result
- browser uses DNS servers configured in its network configuration to query where example.com is
- (2 ms) DNS servers asks the root (`.`) nameservers where `com.` is
- (42 ms) root nameservers give authoritative TLD servers back to DNS server
- DNS server asks authoritative TLD servers where `example.com.` is
- (26 ms) TLD server responds back with the webhost [nameservers](https://kb.apnscp.com/dns/nameserver-settings/) delegated to `example.com.`
- DNS server asks webhost nameservers returned what `example.com.` is
- (15 ms) webhost nameservers reply that the A record for `example.com.` is `1.2.3.4`
- browser sends `GET / HTTP/1.1` for `example.com.` to `1.2.3.4:80`
- web server listening on 1.2.3.4:80 looks up its configuration in memory, finds a match, corresponding [index file](https://kb.apnscp.com/web-content/where-is-site-content-served-from/), and serves it under a `HTTP/1.1 200 OK` response
- browser renders your webpage

Parenthesized terms are the overhead incurred during each step of the query. In this example, the total DNS overhead is 85 ms. Network overhead will vary depending upon physical distance from each DNS resolver queried to get an answer: longer distance -> more network cable to travel over.

### Cached query

Because of the overhead involved in resolving IP addresses, a cache is built into each step of the query to reduce network latency. This value is dictated by the [TTL](https://kb.apnscp.com/dns/how-long-does-dns-propagation-take/) (time-to-live) parameter, a holdover of [DNS specification](https://tools.ietf.org/html/rfc1034#page-12), introduced in 1987 when network latency was high, connections were sporadic, and a recursive query could add up to 30 seconds if not outright failure.

- (0 ms) browser queries local DNS resolver (on same computer) where example.com is
- (1 ms) local DNS resolver has result in cache, returns `1.2.3.4`
- browser sends `GET / HTTP/1.1` for `example.com.` to `1.2.3.4:80`
- web server listening on `1.2.3.4:80` looks up its configuration in memory, finds a match, corresponding [index file](https://kb.apnscp.com/web-content/where-is-site-content-served-from/), and serves it under a `HTTP/1.1 200 OK` response
- browser renders your webpage

Because a DNS response occurred in-memory on the same computer requesting the page, all latter DNS steps are skipped resulting in a DNS response time of 1 ms.

## See also

- KB: [Reducing DNS propagation time](https://kb.apnscp.com/dns/reducing-dns-propagation-time/)
