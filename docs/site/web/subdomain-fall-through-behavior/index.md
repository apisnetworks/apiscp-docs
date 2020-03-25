---
title: "Subdomain fall-through behavior"
date: "2014-11-01"
---

## Overview

Subdomains created within the control panel via **Web** > **Subdomains** will map to corresponding _[document roots](https://kb.apnscp.com/web-content/where-is-site-content-served-from/)_. Subdomains not explicitly defined under **Web** > **Subdomains**, called a fall-through, will always serve content from your primary domain located under `/var/www/html`.

Example: assume _web.mydomain.com_ maps to `/var/www/web`, and _mydomain.com_ is the main domain that serves content from `/var/www/html`. "_web_" is the only subdomain associated with the account.

- http://web.mydomain.com will serve content from `/var/www/web`
- http://www.web.mydomain.com will serve content from `/var/www/web`
- http://mydomain.com serves content from `/var/www/html`
- http://weeb.mydomain.com or http://adkjsdhfksaewfiujohewiuiu3b4iubfuidjnkv.mydomain.com will serve content from `/var/www/html` (_fall-through behavior_)

## Solution

To stop this behavior, create a [`.htaccess`](https://kb.apnscp.com/guides/htaccess-guide/) file under `/var/www/html` with the following lines:

RewriteEngine On
RewriteCond %{HTTP\_HOST} !^(www\\.)?mydomain.com \[NC\]
RewriteRule .\* - \[R=404,L\]

Substitute _mydomain.com_ with your actual domain name.
