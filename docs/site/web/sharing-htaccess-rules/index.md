---
title: "Sharing .htaccess rules"
date: "2017-02-13"
---

## Overview

An [.htaccess](https://kb.apnscp.com/guides/htaccess-guide/) file may be shared across multiple domains and subdomains by being located in a common parent directory. Locating an .htaccess under `/var/www` will allow any domain or subdomain located under `/var/www` to inherit these rules; effectively any domain or subdomain that is not managed by a secondary user within that user's respective [home directory](https://kb.apnscp.com/platform/home-directory-location/).

For example, assume the following layout:

- example.com -> /var/www/example/example.com
- sub.example.com -> /var/www/example/sub
- blog.example.com -> /var/www/example/blog

In this situation, to have a common .htaccess shared among these 3 hostnames, locate the .htaccess file in `/var/www/example`.
