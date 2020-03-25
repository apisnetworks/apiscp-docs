---
title: "Passenger applications do not inherit htaccess rules"
date: "2016-02-17"
---

## Overview

[.htaccess](https://kb.apnscp.com/guides/htaccess-guide/) files are used to control behaviors of applications by overriding global server configuration. Any [Passenger-based](https://kb.apnscp.com/cgi-passenger/passenger-supported-apps/) application, which includes Node, Python, and Ruby, will stop processing rules beyond the [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/), often noted by [convention](https://kb.apnscp.com/cgi-passenger/passenger-application-layout/) as `public/`.

## Cause

Passenger is managed by a separate facility that immediately takes control of the request once Apache detects that the document root is a Passenger application. Existing .htaccess directives, if provided in the [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/), are applied; however, any directives that lie below the document root (often noted as `public/`) are not inherited by design.

This is reflected by _apache2\_module_/_[Hooks.cpp](https://github.com/phusion/passenger/blob/stable-5.0/src/apache2_module/Hooks.cpp)_: `passenger_register_hooks()`, which blocks [mod\_dir](https://httpd.apache.org/docs/2.4/mod/mod_dir.html) (_Hooks.cpp_: `startBlockingModDir()`) that would be responsible for index negotiation, and therefore fulfillment of the request and .htaccess inheritance.

## Solution

.htaccess directives must be located immediately in the [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/) of the Passenger application. No known workarounds exist to recursively inherit rules.
