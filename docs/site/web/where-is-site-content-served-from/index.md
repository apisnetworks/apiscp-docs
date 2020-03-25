---
title: "Where is site content served from?"
date: "2014-10-29"
---

Site content for a given domain or subdomain is served from its _document root_. A document root is the base folder from which all content is served. All accounts have a document root for the primary domain under `/var/www/html`. `mainwebsite_html/` is a link to this location.

Sample Home Directory

$ ls ~ drwx------ Aug 21 12:15 Mail lrwxrwxrwx Aug 21 12:17 mainwebsite\_html -> ../../var/www/html

Whenever a domain is added through **DNS** > **Addon Domains** or subdomain created through **Web** > **Subdomains**, the directory specified will be the location from which content for that given domain or subdomain is served.

## An example

Consider `example.com` is an addon domain. The _document root_ for this domain is `/var/www/example.com`. Accessing http://example.com/myfile.html would serve the file from `/var/www/example.com/myfile.html`. Accessing http://example.com/myimages/someimage.jpg would serve the file from `/var/www/example.com/myimages/someimage.jpg` and so on.

## But be careful...

As seen, whatever directory specified acts as location from which content is served. What if mydomain.com serves from `/var/www/html` and example.com serves from `/var/www/html/example.com`? It would be possible to reference content for example.com with a cleverly-crafted URL: http://mydomain.com/example.com/index.html points to the same file resource as http://example.com/index.html!

.htaccess rules for mydomain.com under `/var/www/html` would be applied to example.com. Any mod\_rewrite, [PHP](https://kb.apnscp.com/php/changing-php-settings/), or general Apache directives will be applied to both mydomain.com and example.com. Unless sharing common directives among multiple sites is required, _always place addon domains and subdomains under /var/www_.
