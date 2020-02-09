---
title: "Flask Quickstart"
date: "2015-03-08"
---

## Overview

[Flask](http://flask.pocoo.org/) is a Python microframework for building web sites with minimal overhead. Think of it as a lightweight version of Django with fewer features, but better speed. Flask is supported on [v6+](https://kb.apiscp.com/platform/determining-platform-version/ "Determining platform version") platforms using [Passenger](http://www.phusionpassenger.com).

## Quickstart

All steps are done from the [terminal](https://kb.apiscp.com/terminal/accessing-terminal/ "Accessing terminal"). While it may be possible to deploy a Flask application without using terminal, it is strongly recommended for ease.

1. Prerequisite: create a [Passenger-compatible](https://kb.apiscp.com/cgi-passenger/passenger-application-layout/ "Passenger application layout") filesystem layout
2. Change directories to the base, we'll name the base directory `flask` in `/var/www`
    - `cd /var/www/flask`
3. _Optional_: determine which [Python version](https://kb.apiscp.com/python/changing-python-versions/ "Changing Python versions") to use for Flask using pyenv
4. Install flask using [pip](https://kb.apiscp.com/python/installing-packages/ "Installing packages"):
    - pip install flask
        
5. Create a Passenger startup file to run Flask as a Python [WSGI application](https://kb.apiscp.com/python/using-wsgi/ "Using WSGI"):
    - from flask import Flask
        application = Flask(\_\_name\_\_)
         
        @application.route("/")
        def hello():
         return "Hello World!"
        
        if \_\_name\_\_ == "\_\_main\_\_":
         application.run()
        
    - _Of importance_, this example is identical to the Flask "Hello World!" example with a minor change: `app` is renamed to `application` to comply with Passenger. Passenger will always look for an instance variable named `application` to run the application.
6. Connect `public/` to a subdomain within the control panel under **Web** > **Subdomains**
7. Access your subdomain running Flask

### Restarting a Flask app

Since Flask runs using Passenger, it uses the same [restart method](https://kb.apiscp.com/ruby/restarting-passenger-processes/ "Restarting Passenger processes") as any Passenger-backed app.

## See also

- [Explore Flask](https://exploreflask.com/) eBook
- [Flask documentation](http://flask.pocoo.org/docs/latest/)
- [Django vs Flask vs Pyramid](https://www.airpair.com/python/posts/django-flask-pyramid)
- [Flask demo](http://flask.sandbox.apiscp.com/) running on a v6 account
