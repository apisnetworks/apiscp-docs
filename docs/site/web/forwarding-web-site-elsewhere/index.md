---
title: "Forwarding a web site elsewhere"
date: "2017-02-12"
---

## Overview

A forwarded website can be accomplished by first creating a [subdomain](https://kb.apnscp.com/web-content/creating-subdomain/) or [addon domain](https://kb.apnscp.com/control-panel/creating-addon-domain/) in the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/), then using an [.htaccess](https://kb.apnscp.com/guides/htaccess-guide/) in [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/) to redirect all traffic to the new web site using [mod\_rewrite](http://httpd.apache.org/docs/current/mod/mod_rewrite.html).

### Important terminology

- Forwarded domain: domain that will redirect to the target domain
- Target domain: domain that is the final destination of the forwarded domain
- Path capture: take the path in the url, e.g. `/foo/bar/baz` in `http://example.com/foo/bar/baz`, and transfer that path to the target domain. This is accomplished with a [regex capture](https://regexone.com/lesson/capturing_groups)

### Direct Forward, No Path Capture

Add the following lines to your .htaccess file in the document root of the forwarded domain (or subdomain) that you would like to redirect. Once a user accesses the website, the browser location will change to reflect the target domain.

`RewriteEngine On` `RewriteRule ^ http://DESTINATIONSITE/OPTIONALURL [R=301,L]`

### Direct Forward, Path Capture

`RewriteEngine On` `RewriteRule ^(.*)$ http://DESTINATIONSITE/$1 [R=301, L]`

### Proxied Forward, Path Capture

A proxied forward will attempt to keep the original domain in the Location bar of the browser and impersonate the target site as if it were hosted under the forwarded domain. There are **several limitations** to this approach that are only resolvable by manipulating the stream as it comes over the wire, which is also beyond the scope of this article but accomplished with reverse proxy middleware as is used in apnscp to [redirect](https://github.com/apisnetworks/cp-proxy/blob/master/app.js) cp.apnscp.com to each platform's control panel.

`RewriteEngine On` `RewriteRule ^(.*)$ http://DESTINATIONSITE/$1 [**P**,L,QSA]`

A proxied forward will leak the target domain's location if the target domain uses absolute URLs or sends a "Location:" header as if forwarding in one of the two above examples.

## Redirect Codes

Each redirect in the aforementioned examples uses "301". There are 4 types of redirects to familiarize yourself with, each code is pragmatic in that it instructs the browser or search engine how to handle the response:

- **301**: Permanent redirect. Clients making subsequent requests for this resource should use the new URL. Clients should **not** follow the redirect automatically for POST/PUT/DELETE requests.
- **302**: Redirect for undefined reason. Clients making subsequent requests for this resource should **not** use the new URL. Clients should **not** follow the redirect automatically for POST/PUT/DELETE requests.
- **303**: Redirect for undefined reason. Typically, 'Operation has completed, continue elsewhere.' Clients making subsequent requests for this resource should **not** use the new URL. Clients **should** follow the redirect for POST/PUT/DELETE requests.
- **307**: Temporary redirect. Resource may return to this location at a later point. Clients making subsequent requests for this resource should use the old URL. Clients should **not** follow the redirect automatically for POST/PUT/DELETE requests.

_Credit: [Bob Aman](http://stackoverflow.com/questions/4764297/difference-between-http-redirect-codes#4764456), StackOverflow_

## See Also

- [URL Rewriting Guide](http://httpd.apache.org/docs/2.0/misc/rewriteguide.html) (apache.org)
- [Regular Expression Tutorial - Learn How to Use Regular Expressions](http://www.regular-expressions.info/tutorial.html) (regular-expressions.info)
- [Redirection - Best Practices](https://moz.com/learn/seo/redirection) (moz.com)
