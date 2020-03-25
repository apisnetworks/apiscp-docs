---
title: "HTTPS connection displays mixed-mode notice"
date: "2016-04-29"
---

## Overview

Accessing a website, protected by SSL, yields a "mixed-mode" notice or the SSL indicator displays different than normal.

\[caption id="attachment\_1279" align="aligncenter" width="83"\][![mixed-mode-indicator](https://kb.apnscp.com/wp-content/uploads/2016/04/mixed-mode-indicator.png)](https://kb.apnscp.com/wp-content/uploads/2016/04/mixed-mode-indicator.png) Mixed mode encountered on a website using Firefox\[/caption\]

## Cause

SSL is designed to protect data transfer from third-party snooping through encryption. By accessing a resource over a non-encrypted stream (e.g. including an image on a site as _<img src="http://mysite.com/img.jpg" />_), this protection is circumvented. The request is made without encryption allowing third-parties to potentially sniff traffic. Browsers will alert you when these situations are encountered as security is of everyone's absolute utmost concern.

## Solution

Two options exist, either change all links from http:// to https:// or as a more concise form, use a protocol-relative URL by omitting the protocol entirely such that <img src="http://mysite.com/img.jpg" /> becomes <img src="//mysite.com/img.jpg" />

## See also

- [The Protocol-relative URL](http://www.paulirish.com/2010/the-protocol-relative-url/) (Paul Irish)
