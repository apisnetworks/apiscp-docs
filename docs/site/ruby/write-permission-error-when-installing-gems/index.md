---
title: "Write permission error when installing gems"
date: "2015-05-01"
---

## Overview

On newer [v6+ platforms](https://kb.apnscp.com/platform/determining-platform-version/) with support for multiple Ruby interpreters, installing a gem may fail resulting in a similar error message:

 \[user@sol ~\]$ gem install --no-rdoc --no-ri passenger rails
 Fetching: passenger-5.0.6.gem (100%)
 ERROR: While executing gem ... (Gem::FilePermissionError)
 You don't have write permissions for the /.socket/ruby/gems/ruby-2.1.2 directory.

## Cause

The environment variable `GEM_HOME` is not configured until `rvm use` is executed Rubygems attempts to install to the system default directory, which must be reconfigured, at run-time with rvm.

## Solution

Select which [Ruby version to use](https://kb.apnscp.com/ruby/changing-ruby-versions/) with rvm use. This will install a rvm shim necessary to set GEM\_HOME.

cd /var/www
# rvm shim is installed under /var/www
rvm use 2.2.2
# rvm will confirm this version is selected
gem install --no-rdoc --no-ri rails
# Rails installs now without incident
