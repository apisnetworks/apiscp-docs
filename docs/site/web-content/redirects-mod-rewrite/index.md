---
title: "Redirects with mod_rewrite"
date: "2016-01-23"
---

## Overview

A redirect changes the URL, in browser, from one URL to another. A variety of redirect codes exist to force a variety of behaviors in the browser (or spider).

## Usage

All redirects are controlled through a [.htaccess](https://kb.apnscp.com/guides/htaccess-guide/) file in the [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/) of your target [domain](https://kb.apnscp.com/control-panel/creating-addon-domain/) or [subdomain](https://kb.apnscp.com/web-content/creating-subdomain/). The following stanza is a common, and simple redirect if the URL is www.example.com, then redirect to example.com:

RewriteEngine On
RewriteBase /
RewriteCond %{HTTP\_HOST} ^www\\.example\\.com$
RewriteRule ^(.\*)$ http://example.com/$1 \[R,L\]

Likewise, a converse rule to redirect example.com to www.example.com would be a minor alteration of `RewriteCond` and `RewriteRule`:

RewriteEngine On
RewriteBase /
RewriteCond %{HTTP\_HOST} ^example\\.com$
RewriteRule ^(.\*)$ http://www.example.com/$1 \[R,L\]

Notice the difference? RewriteCond stands for "rewrite condition" and RewriteRule "rewrite rule". That is to say, if this _condition_ matches, apply this _rule_, which consists of a regular expression substitution, to the current URL. Rewrites operate using [regular expressions](http://httpd.apache.org/docs/current/rewrite/intro.html), in particular [Perl-compatible ("PCRE")](https://en.wikipedia.org/wiki/Perl_Compatible_Regular_Expressions).

## Required components

A redirect _**always**_ requires two crucial components:

RewriteEngine On
RewriteBase /

`RewriteEngine On` enables URL rewriting. `RewriteBase /` anchors all rules to the current directory. \[su\_highlight\]RewriteBase is absolutely necessary when used with addon domains and subdomains.\[/su\_highlight\]

The following examples will omit these 2 lines for brevity:

### Examples

#### Redirect to SSL

RewriteCond %{HTTPS} !^on$
RewriteRule ^(.\*)$ https://%{HTTP\_HOST}/$1 \[R,L\]

**Discussion:** look for an environment variable called `HTTPS`. Whenever SSL is used, this variable is set by the web server. If no flag is set, assume normal HTTP traffic. Redirect to SSL (https) and keep the hostname (`%{HTTP_HOST}`) + URL path (`$1`, captured from left-side)

### Redirect codes

An optional number may be added onto a R flag to specify a redirect code. By default a 302 is sent in a redirect response. The following redirect codes may be used by changing `R` to `R=XXX`, where XXX is one of the following codes:

\[su\_table\]

**Code**

**Name**

**Description**

301

Moved Permanently

Resource is no longer accessible under URL, use new URL

302

Found

URL resides temporarily under new resource, continue to use this URL

303

See Other

Response resides elsewhere and should be retrieved using a GET; used mostly with POST requests

307

Temporary Redirect

URL resides elsewhere; new location may differ on different requests. Continue to use this URL in future.

308

Permanent Redirect

Similar to 301, works with POST, but _[experimental](https://tools.ietf.org/html/rfc7238)_

\[/su\_table\]

## See also

- [Introduction to regular expressions and mod\_rewrite](http://httpd.apache.org/docs/current/rewrite/intro.html) (httpd.apache.org)
- [URL rewriting with mod\_rewrite](http://httpd.apache.org/docs/current/rewrite/) (httpd.apache.org)
