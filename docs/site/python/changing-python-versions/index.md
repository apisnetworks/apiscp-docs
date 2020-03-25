---
title: "Changing Python versions"
date: "2015-02-12"
---

### Overview

Recent platforms ([v6+](https://kb.apnscp.com/platform/determining-platform-version/)) support multiple Python interpreters from the shell using [pyenv](https://github.com/yyuu/pyenv). pyenv allows seamless switching between available Python versions, and manages version-specific [package installations](https://kb.apnscp.com/python/installing-packages/) too.

## Basics

All commands are done from the [terminal](https://kb.apnscp.com/terminal/accessing-terminal/).

### Listing versions

To get a current list of available Python interpreters, use `pyenv versions`:

`[myadmin@sol ~]$ pyenv versions system 2.7.8 * 3.3.5 (set by /home/myadmin/.python-version) 3.4.1`

Of importance is `system`, which is the default system interpreter. Without pyenv installed, `system` is the default interpreter used. `2.7.8`, `3.3.5`, and `3.4.1` are additional interpreters installed in addition to the system version under `/.socket/python/versions`.

### Selecting a version

A version may be defined per-directory and inherited recursively within all child directories. Versions are defined for a directory, and its child directories, by `pyenv local`:

`[myadmin@sol ~]$ pyenv version 3.3.5 (set by /home/myadmin/.python-version) [myadmin@sol ~]$ cd /var/www/ [myadmin@sol www]$ pyenv local system [myadmin@sol www]$ pyenv version system (set by /var/www/.python-version) [myadmin@sol www]$ cd ~/test [myadmin@sol ~/test]$ pyenv version 3.3.5 (set by /home/myadmin/.python-version)`

Two versions of Python are defined, one in `/home/myadmin` and another in `/var/www`. Versions are controlled by a file called `.python-version` and pyenv will ascend each parent directory until it reaches root (`/`) or `.python-version` is found. If no control file is found, the current Python interpreter will be used.

You can then delegate a single Python version to handle a collection of projects by locating projects under an additional directory and defining a Python version in its parent directory:

www       <-- NO .python-version
|-- proj3 <-- .python-version (3.3.5)
| |-- mydjango  (3.3.5)
| \`-- flask     (3.3.5)
\`-- proj2 <-- .python-version (2.7.5)
  |-- newdjango (2.7.5)
  \`-- mezzanine (2.7.5)

Control files are located under `/var/www/proj3` and `/var/www/proj2` allowing projects located under these directories to use Python 3 or Python 2 respectively.

### Package locations

Packages are installed using [pip](https://kb.apnscp.com/python/installing-packages/) as normal. Packages are located under `/usr/local/lib/python/_<MAJOR>_._<MINOR>_._<PATCH>_` using [semantic versioning](http://www.semver.org) to avoid conflict. Any binaries installed under /usr/local/bin, however, will conflict with each other if those binaries, bundled in different versions of the package, differ. [pyenv-virtualenv](https://github.com/yyuu/pyenv-virtualenv#usage) + [virtualenv](https://virtualenv.pypa.io/en/latest/) is recommended to isolate packages of different versions that rely on the same Python interpreter.

### Caveats

#### Shebangs

Shell or FastCGI scripts typically begin with `#!/usr/bin/python`. This is the system version that will bypass pyenv initialization. Change this line to `#!/usr/bin/env python` to use python found in the shell path.

## See also

- [pyenv](https://github.com/yyuu/pyenv) github
- [virtualenv](https://virtualenv.pypa.io/en/latest/) (manage same Python version, different package versions)
