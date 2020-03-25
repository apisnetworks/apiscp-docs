---
title: "Flask Quickstart"
date: "2015-03-08"
---

## Overview

[Flask](http://flask.pocoo.org/) is a Python microframework for building web sites with minimal overhead. Think of it as a lightweight version of Django with fewer features, but better speed. Flask is supported on [v6+](https://kb.apnscp.com/platform/determining-platform-version/) platforms using [Passenger](http://www.phusionpassenger.com).

## Quickstart

All steps are done from the [terminal](https://kb.apnscp.com/terminal/accessing-terminal/). While it may be possible to deploy a Flask application without using terminal, it is strongly recommended for ease.

1. Prerequisite: create a [Passenger-compatible](https://kb.apnscp.com/cgi-passenger/passenger-application-layout/) filesystem layout
2. Change directories to the base, we'll name the base directory `flask` in `/var/www`
    - `cd /var/www/flask`
3. _Optional_: determine which [Python version](https://kb.apnscp.com/python/changing-python-versions/) to use for Flask using pyenv
4. Install flask using [pip](https://kb.apnscp.com/python/installing-packages/):
    - pip install flask
        
5. Create a Passenger startup file to run Flask as a Python [WSGI application](https://kb.apnscp.com/python/using-wsgi/):
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

Since Flask runs using Passenger, it uses the same [restart method](https://kb.apnscp.com/ruby/restarting-passenger-processes/) as any Passenger-backed app.

## See also

- [Explore Flask](https://exploreflask.com/) eBook
- [Flask documentation](http://flask.pocoo.org/docs/latest/)
- [Django vs Flask vs Pyramid](https://www.airpair.com/python/posts/django-flask-pyramid)
- [Flask demo](http://flask.sandbox.apnscp.com/) running on a v6 account
