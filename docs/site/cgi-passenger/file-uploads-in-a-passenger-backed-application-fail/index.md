---
title: "File uploads in a Passenger-backed application fail"
date: "2016-05-01"
---

## Overview

A file upload initiated in an application written in Ruby, Node, or Python launched through [Passenger](https://kb.apnscp.com/cgi-passenger/passenger-supported-apps/) will fail to upload. Thus far, the confirmed failure occurs in [RefineryCMS](http://www.refinerycms.com/) with a generic undefined route message following upload.

\[caption id="attachment\_1285" align="aligncenter" width="998"\][![Example conflict in RefineryCMS. Following upload, RefineryCMS reports the route as undefined.](https://kb.apnscp.com/wp-content/uploads/2016/04/refinerycms-upload-screening-conflict.png)](https://kb.apnscp.com/wp-content/uploads/2016/04/refinerycms-upload-screening-conflict.png) Example conflict in RefineryCMS. Following upload, RefineryCMS reports the route as undefined.\[/caption\]

## Cause

It is a conflict between [upload screening](https://kb.apnscp.com/web-content/uploads-are-denied-with-406-not-acceptable/) and Passenger, but the underlying cause is not clearly understood. Upload screening was added to enhance server security effective April 6, 2016.

## Solution

Open a ticket in the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) to request disabling upload screening on files. Once disabled, file uploads will post without interruption.
