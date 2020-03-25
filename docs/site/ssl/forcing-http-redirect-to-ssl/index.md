---
title: "Forcing HTTP redirect to SSL"
date: "2014-11-09"
---

## Overview

Converting HTTP to HTTPS resources can be accomplished in several ways. It goes without saying that you should setup and test your SSL certificate before performing any of the following methods.

### Strict Transport Security

Modern browsers support a security standard called "[HTTP Strict Transport Security](https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security)", or HSTS for short. HSTS sends a header with the URI response to indicate that future requests should use HTTPS.

To utilize HSTS, add the following line to a [.htaccess](https://kb.apnscp.com/guides/htaccess-guide/) in the [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/) of the domain/subdomain:

```
Header always set Strict-Transport-Security "max-age=63072000;"

```

The above example restricts mandatory SSL for the domain only. To extend this policy to subdomains as well, such as forum.example.com and blog.example.com, add "includeSubdomains":

```
Header always set Strict-Transport-Security "max-age=63072000; includeSubdomains;"
```

**Downsides:** first request if sent over HTTP will not be encrypted, requires browser compliance

**Upsides: **easy to implement, SSL can propagate to subdomains, directive is cached in browser

### mod\_rewrite Rewrite

By utilizing [mod\_rewrite](http://httpd.apache.org/docs/current/mod/mod_rewrite.html), add the following to a [.htaccess](https://kb.apnscp.com/guides/htaccess-guide/) file in the [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/) of the domain/subdomain that you would like to redirect:

RewriteEngine On
RewriteBase /
RewriteCond %{HTTPS} !^on$
RewriteRule ^(.\*)$ https://%{HTTP\_HOST}/$1 \[R,L\]

**Downsides:** can be complex, does not extend to subdomains without a [common parent](https://kb.apnscp.com/web-content/sharing-htaccess-rules/) directory, can create a redirect loop

**Upsides: **extremely flexible implementation

### WordPress

WordPress creates absolute URIs. If WordPress is installed over http://, then all URIs will reflect http://. To convert generated URIs from http:// to https://, login to the WordPress [administrative panel](https://kb.apnscp.com/wordpress/access-wordpress-admin-panel/), go to **Settings** > **General**. Change both the WordPress Address and Site Address fields from http://... to https://... If not all links, such as old posts, have changed correctly, use a third-party plugin such as [Really Simple SSL](https://wordpress.org/plugins/really-simple-ssl/) to update all post data.

\[caption id="attachment\_1427" align="aligncenter" width="300"\][![](https://kb.apnscp.com/wp-content/uploads/2014/11/wordpress-ssl-300x66.png)](https://kb.apnscp.com/wp-content/uploads/2014/11/wordpress-ssl.png) WordPress SSL tunables\[/caption\]
