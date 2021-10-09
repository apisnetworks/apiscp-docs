---
title: "Django quickstart"
date: "2015-01-24"
---

## Overview

[Django](https://www.djangoproject.com/) is a web framework based on [Python](https://www.python.org/). Python is available on all packages, and a Django application may be uploaded on any package. But, to create a new project on the server and complete this quickstart, a package [with terminal access](https://kb.apnscp.com/terminal/is-terminal-access-available/) is necessary. This quickstart covers using Django with [Passenger](https://www.phusionpassenger.com/) available on [v6+ platforms](https://kb.apnscp.com/platform/determining-platform-version/).

## Quickstart

From the [terminal](https://kb.apnscp.com/terminal/accessing-terminal/), first install Django + MySQL from PyPI using Python's [package manager](https://kb.apnscp.com/python/installing-packages/), pip.

`pip install django mysql`

**Important (_v6+ platforms_):** On v6+ platforms, first designate a [Python interpreter](https://kb.apnscp.com/python/changing-python-versions/) (do not use the default, "system"), then after installation, change the [interpreter location](https://kb.apnscp.com/python/python-bins-fail-import-library/) of `/usr/local/bin/django-admin`.

Now, Django has been installed on your account. Setup a Django application. We'll modify Django slightly to create a web-accessible public/ folder and keep code outside a URL-accessible resource, one level down from the [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/).

1. Switch to /var/www to create a new project:
    - `cd /var/www`
2. Initialize an application named myapp
    - `django-admin startproject myapp`
    - **Note:** per documentation, it's recommended not to initialize projects under /var/www. This is only true if /var/www is accessible as a [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/) (which it is not)
3. Django creates a management controller (`manage.py`) within the folder named after the project, in addition to an app named after the project, one level down. Move to the app folder from `/var/www`:
    - `cd myapp/myapp`
4. Make a `public/` and `tmp/` directory for serving public files and storing logs. tmp/ will be used to control application restarts with Passenger.
    - `mkdir tmp public`
5. Passenger will look for a file called `passenger_wsgi.py` inside `/var/www/myapp/myapp`, create a link to satisfy this
    - `ln -s wsgi.py passenger_wsgi.py`
6. Edit `passenger_wsgi.py` to append your application path to Python. This requires 2 minor additions:
    - **Before:**
        
        import os
        os.environ.setdefault("DJANGO\_SETTINGS\_MODULE", "myapp.settings")
        from django.core.wsgi import get\_wsgi\_application
        application = get\_wsgi\_application()
        
    - **After:**
        
        import os, sys
        sys.path.append("/var/www/myapp")
        os.environ.setdefault("DJANGO\_SETTINGS\_MODULE", "myapp.settings")
        from django.core.wsgi import get\_wsgi\_application
        application = get\_wsgi\_application()
        
    - **Explanation:** only the first 2 lines are changed: (1) [sys module](https://docs.python.org/2/library/sys.html) is loaded after os, this is necessary for (2) appending a library path via `sys.path.append`, the value being the _project root_ (`/var/www/myapp` in this case).

7. Lastly, connect this application to a web-accessible path
    - visit **Web** > **Subdomains** within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/). Create a new subdomain called _myapp _with the [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/) `/var/www/myapp/myapp/public`
        
        \[caption id="attachment\_549" align="alignnone" width="300"\][![Linking a Django subdomain underneath a project called myapp and its first app called "myapp" using Passenger.](https://kb.apnscp.com/wp-content/uploads/2015/01/django-subdomain-ex-300x69.png)](https://kb.apnscp.com/wp-content/uploads/2015/01/django-subdomain-ex.png) Linking a Django subdomain underneath a project called myapp and its first app called "myapp" using Passenger.\[/caption\]

8. Within /public:
    - create .htaccess: `nano public/.htaccess` and add:
      
       PassengerEnabled On
       PassengerAppRoot /var/www/myapp/myapp
       PassengerPython /usr/local/share/python/pyenv/shims/python
      
    - if public/index.html exists, remove it: `rm public/index.html`

9. __**Enjoy!**__
    
    \[caption id="attachment\_557" align="alignnone" width="300"\][![Confirmation page that Django is up and running a-OK!](https://kb.apnscp.com/wp-content/uploads/2015/01/django-confirmation-page-300x58.png)](https://kb.apnscp.com/wp-content/uploads/2015/01/django-confirmation-page.png) Confirmation page that Django is up and running a-OK!\[/caption\]

### Restarting your application

An app may either be restarted upon each request or at a single point. To restart an app every invocation, create a file called always\_restart.txt in tmp/: `touch tmp/always_restart.txt`. To perform a single restart, create a file called restart.txt in tmp/: `touch tmp/restart.txt`. Passenger, which handles process management, will compare the timestamp with its internal record and restart as necessary. To restart a second time, either reissue the command or delete, then recreate the file to update its modification time.

### Viewing launcher errors

On newer v6 platforms, launcher errors may be viewed through the consolidated log file, `/var/log/passenger.log`.

## See also

- [Django tutorial](https://docs.djangoproject.com/en/1.7/intro/tutorial01/)
- [The Django Book](http://www.djangobook.com/en/2.0/index.html)
- [Django vs Flask vs Pyramid](https://www.airpair.com/python/posts/django-flask-pyramid)
- Django [demo](http://django.sandbox.apnscp.com) on Sol, a v6 platform
