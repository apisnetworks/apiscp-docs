---
title: "Installing packages"
date: "2015-01-20"
---

## Overview

Python uses a package management system called "[pip](https://pypi.python.org/pypi/pip)". Package management is available on newer hosting platforms [v4.5](https://kb.apnscp.com/platform/determining-platform-version/) and above. [Terminal access](https://kb.apnscp.com/terminal/is-terminal-access-available/) is necessary to use the feature.

## Package management

All packages installed reside under /usr/local/lib/python/_<VERSION> _where _<VERSION>_ is the Python version. Python versions may be switched on-the-fly using [pyenv](https://kb.apnscp.com/python/changing-python-versions/) on [v6 platforms](https://kb.apnscp.com/platform/determining-platform-version/).

**Important platform info: **all commands listed here use `pip`. On older platforms, _pre-v6_, use `pip-python` instead of `pip` to install packages. Syntax remains otherwise the same.

### Installing packages

Use `pip-python install PKGNAME` where PKGNAME is a package name listed in [Python Package Index](https://pypi.python.org/pypi).

To install Django: `pip install django`

`` `[myuser@sol ~]$ pip install django Downloading/unpacking django Running setup.py egg_info for package django` ``warning: no previously-included files matching '\_\_pycache\_\_' found under directory '\*' warning: no previously-included files matching '\*.py\[co\]' found under directory '\*' Installing collected packages: django Running setup.py install for djangowarning: no previously-included files matching '\_\_pycache\_\_' found under directory '\*' warning: no previously-included files matching '\*.py\[co\]' found under directory '\*' changing mode of /usr/local/bin/django-admin.py to 775 Installing django-admin script to /usr/local/bin Successfully installed django Cleaning up...

To install a Python 2.6+ package to your [home directory](https://kb.apnscp.com/platform/home-directory-location/), specify `--user`:

`pip install --user django`

The package, django, will be installed under `~/.local/lib/`.

### Listing packages

To view packages locally installed, issue pip-python list. To view remote packages using basic string matching, use `pip-python search PKGTOKEN`, where _PKGTOKEN_ is a partial package name to search for. You may wish to page long content by piping output to [less](http://apnscp.com/linux-man/man1/more.1.html) as in `pip-python search PKGTOKEN | less`:

``` `` `[myuser@sol ~]$ pip search django-a` `` ```django-autocomplete-light - Fresh autocompletes for Django django-angular-scaffold - AngularJS Scaffolding for Django django-alert - Send alerts, notifications, and messages based on events in your django application django-admin-sortable - Drag and drop sorting for models and inline models in Django admin. django-quickapi - The Django-application for the fast organization API.

### Removing packages

`pip-python uninstall PKGNAME` where _PKGNAME_ is a package installed and listed via `pip-python list`.

### Upgrading packages

`pip-python install --upgrade PKGNAME` where _PKGNAME_ is the package installed and listed via `pip-python list`.
