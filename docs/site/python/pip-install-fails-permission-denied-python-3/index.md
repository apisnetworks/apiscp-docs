---
title: "pip install fails with "Permission denied" on Python 3+"
date: "2015-03-03"
---

## Overview

Python's integrated [package manager,](https://kb.apnscp.com/python/installing-packages/) pip, fails to install packages when Python 3.0 and above is used raising a PermissionError. Below is an abbreviated sample output:

\[myadmin@sol\]$ pip install django
Downloading/unpacking django
Installing collected packages: django
Cleaning up...
Exception:
Traceback (most recent call last):
 File "/.socket/python/python3.4/site-packages/pip/wheel.py", line 205, in clobber
 os.makedirs(destdir)
 File "/.socket/python/python3.4/os.py", line 237, in makedirs
 mkdir(name, mode)
PermissionError: \[Errno 13\] Permission denied: '/.socket/python/python3.4/site-packages/django'

## Cause

pip bundled with Python 3.0 and above include support for [wheel](https://wheel.readthedocs.org/en/latest/), a successor to an earlier package format, [egg](http://pythonhosted.org/setuptools/formats.html). wheel is called after package installation without exposing custom configuration. wheel, unaware that libraries are installed to version-specific directories, tries to install in the system Python location unsuccessfully.

## Solution

Disable wheel processing with `--no-use-wheel` as an argument to `pip install` or add the following configuration within `~/.pip/pip.conf`, inside your [home directory](https://kb.apnscp.com/platform/home-directory-location/):

\[global\]
use-wheel = no

Most accounts should have wheel disabled by default.

## See also

- [\`--install-option\` should work for wheels? #1716](https://github.com/pypa/pip/issues/1716)
