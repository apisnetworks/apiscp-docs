---
title: "Working with HTTP rate-limiting"
date: "2017-09-12"
---

## Overview

All HTTP servers enforce a collection of HTTP rate-limiting to reduce abuse and achieve a high reliability. This system is built on a fork of [mod\_evasive](https://github.com/apisnetworks/mod_evasive), which implements an interval-based bean counter, in other words it begins counting URI requests for a given duration once the first request is received.

There are two classes of URI requests, **pages in total** and **same page** requests. Exceeding either threshold will result in an automatic 10 minute ban. Repeating the process three times in 24 hours results in an automatic 7 day ban for HTTP ports, 80 (HTTP) and 443 (HTTPS).

Blocked clients are returned a 403 status code (_Forbidden_).

## Pages in total

Pages in total (PIT) log all URL requests from an IP address in a window discussed below. If an IP address exceeds that number of requests within the window, it will be blocked automatically. If a page is image heavy as verified by [webpagetest.org](https://webpagetest.org), consider consolidating images into [sprites](https://css-tricks.com/css-sprites/) or [inlining small assets](https://stackoverflow.com/questions/1574961/how-much-faster-is-it-to-use-inline-base64-images-for-a-web-site-than-just-linki) to bypass accessory HTTP requests.

## Same page

Same page requests are more stringent and affect requests to the same URI. This is designed to filter out brute-force attacks. If you poll a page repeatedly, such as autocomplete with a [keydown event](https://developer.mozilla.org/en-US/docs/Web/Events/keydown), add a collection threshold via [setTimeout](https://www.w3schools.com/jsref/met_win_settimeout.asp) that will only poll after the typist has given a momentary repose to collect thought. For instance, a simple [jQuery](https://jquery.com) implementation:

$("#input").on('keydown', function() {
    var timer;
    timer = setTimeout(function() {
        cancelTimeout(timer);
        // cancel other async events
        // do autocomplete AJAX callback
    }, 250 /\*\* 250 milliseconds \*/);
});

This assumes that the person will type at least 4 characters per second. Words per minute is standardized to [5 characters](https://en.wikipedia.org/wiki/Words_per_minute), this it works out to be 48 WPM. You can evaluate for yourself what [48 WPM](https://www.keyhero.com/free-typing-test/) is. To avoid triggering the same-page block, without a delay (via setTimeout), one would need to type of 96 WPM with an autocomplete AJAX callback. Feasible, but unlikely.

## Blocking criteria

The following thresholds are in place to filter bot from human.

**Same page**: 4 pages in 1 second **Pages in total**: 150 pages in 3 seconds

Three blocks in 24 hours results in a seven day ban. Once a ban is in place, the only way to proceed forward is to open a ticket to remove the ban.
