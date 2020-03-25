---
title: "Python bins fail to import library"
date: "2015-02-23"
---

## Overview

A binary (bin) file installed as part of a Python package, e.g. `django-admin` from [Django](https://kb.apnscp.com/python/django-quickstart/) will fail upon execution - even after successful installation via `pip` - because it cannot locate its corresponding Python library.

**Example:**

\[myadmin@sol www\]$ django-admin
Traceback (most recent call last):
 File "/usr/local/bin/django-admin", line 7, in <module>
 from django.core.management import execute\_from\_command\_line
 portError: No module named django.core.management

## Cause

Bin helpers, like `django-admin`, will bootstrap itself to make it an executable shell script by injecting the interpreter used to run pip into itself on installation. [pyenv](https://kb.apnscp.com/python/changing-python-versions/), which provides support for multiple Python interpreters to coexist on an account, looks for a control file named `.python-version` file; then, if found, executes the corresponding Python interpreter. These interpreters reside under `/.socket/python/versions` _and_ it is these Python interpreters that are accidentally injected into the first line to make an executable shell script.

## Solution

Edit the file, usually located under `/usr/local/bin`, and replace the first line (shebang) that begins with `#!/.socket/python/` with `#!/usr/bin/env python`.

You can confirm the path by using [which(1)](http://apnscp.com/linux-man/man1/which.1.html):

\[myadmin@sol www\]$ which django-admin
/usr/local/bin/django-admin
\[myadmin@sol www\]$ nano /usr/local/bin/django-admin
# Now edit the first line of django-admin to correct the shebang

**Explanation: **the Python interpreter is replaced with pyenv's wrapper script, `python` that resides under `/.socket/python/shims/python`. We use `env` as a trick to propagate environment variables and execute "_python_" under the current `PATH`, which is shimmed with `/.socket/python/shims` before `/usr/bin` or any other system path. `python` is sourced from this directory, because it is the first directory to appear in the `PATH` environment variable that contains the command, "_python_" resulting in running pyenv's version of `python`.
