---
title: "Restarting Passenger processes"
date: "2015-02-13"
---

## Overview

An application launched by Passenger may be restarted by creating a file in `tmp/` (_NB: not `/tmp`_) within the application root directory, usually one level down [from public/](https://kb.apnscp.com/web-content/where-is-site-content-served-from/). Create a file under `tmp/` named `restart.txt` to restart the application once. A restart will happen within 2 minutes.

To restart an application on every request, very useful for in-place debugging, create a file named `always_restart.txt`.

**Note:** do not leave `always_restart.txt` file for an application in production. This results in very poor performance.
