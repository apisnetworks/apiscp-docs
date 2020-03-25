---
title: "Using WSGI"
date: "2015-02-13"
---

## Overview

Python applications can be launched using [Passenger](https://kb.apnscp.com/python/using-multiple-versions-passenger/) offering improved throughput and lifecycle management. Launching CGI scripts wrapped by `pyenv` will yield very poor throughput as a result of multiple shell subprocesses necessary to ascertain the correct Python interpreter. Adapting a CGI application to WSGI improves throughput significantly by reducing overhead through a persistent process. Pages load quickly, and applications utilize resources efficiently.

**Note:** This KB requires a [v6+](https://kb.apnscp.com/platform/determining-platform-version/) hosting platform.

## Simple WSGI script

**Prerequisite**: First, follow the guide in [Using multiple versions with Passenger](https://kb.apnscp.com/python/using-multiple-versions-passenger/) to create a suitable directory structure.

Create a Passenger-compatible WSGI script named `passenger_wsgi.py` beneath the `public/` folder. A single function, similar to main() in a C application, named `application()` is the entry-point for Passenger. Without this function and named file, Passenger cannot load your application. The below example is compatible with Python 3:

\# Python 3-compatible version
import sys
ctr=0

def application(environ, start\_response):
 global ctr
 start\_response('200 OK', \[('Content-Type', 'text/plain')\])
 v = sys.version\_info
 ctr+=1
 str = 'hello world from %d.%d.%d!\\n' % (v.major, v.minor, v.micro)
 return \[bytes(str, 'UTF-8')\]

Your directory structure should now look like:

.
├── passenger\_wsgi.py
├── public/
├── .python-version
└── tmp/

`.python-version` is a file created by defining a Python version for the directory, e.g. `pyenv local 3.3.5`. Connect the `public/` [folder](https://kb.apnscp.com/web-content/where-is-site-content-served-from/) to a subdomain within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) under **Web** > **Subdomains**.

### Application didn't launch?

Check the Passenger launcher [error log](https://kb.apnscp.com/web-content/accessing-page-views-and-error-messages/) under `/var/log/httpd/passenger.log`. This is a combined logfile, so always remember to publish coherent, and flawless code!
