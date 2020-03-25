---
title: "Passenger-backed apps perform unscripted optimizations"
date: "2016-02-17"
---

## Overview

Applications launched through [Passenger](https://kb.apnscp.com/cgi-passenger/passenger-supported-apps/), which includes Node, Python, Ruby, and Meteor, may receive optimizations to JavaScript, CSS, and image assets which are not explicitly defined within application logic.

Take for example a small external JavaScript asset that may become inlined _after the first request_:

<head>
<script src="//test.js""></script>
<!-- rest of head -->

becomes:

<head>
<script>//<!\[CDATA\[
console.log("Hello 212a.");
//\]\]>
</script>
 <!-- rest of head -->

## Cause

This is caused by an interaction between [Pagespeed](https://kb.apnscp.com/web-content/pagespeed-support/) and Passenger. Pagespeed attempts to optimize inefficient layouts by performing a [litany of optimizations](https://developers.google.com/speed/pagespeed/module/config_filters), including inlining external requests that reside on the same domain if the embedded cost is less than the cost of making a subsequent HTTP request to fetch the asset.

## Solution

Disable Pagespeed (see KB: [Disabling PageSpeed](https://kb.apnscp.com/web-content/disabling-pagespeed/)) by locating the rule within the [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/) for the site. Note that Passenger-backed apps do not recursively inherit .htaccess rules as would be the case if the application were not managed by Passenger.
