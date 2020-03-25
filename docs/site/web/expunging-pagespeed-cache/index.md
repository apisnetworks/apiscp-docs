---
title: "Expunging PageSpeed cache"
date: "2016-06-22"
---

PageSpeed will make a best effort to expire its asset (.css, .js, .png, .gif, .jpg) cache periodically. During periods of rapid changes, automatic expunction may lag behind changes pushed to a server necessitating a manual flush of the cache.

## Expunging PageSpeed cache

A `PURGE` header may be sent to the asset forcing PageSpeed to expunge its cached copy from memory. For example to accomplish this using cURL from the [terminal](https://kb.apnscp.com/terminal/is-terminal-access-available/):

curl -v -X PURGE http://web.site/asset/style.css

To expunge every entry under a common URL or on a web site, use an asterisk:

curl -v -X PURGE http://web.site/asset/\*

## See also

- [Flushing PageSpeed Server-Side Cache](https://developers.google.com/speed/pagespeed/module/system#purge_cache) (developers.google.com)
