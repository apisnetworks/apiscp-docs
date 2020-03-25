---
title: "Changing Ruby versions"
date: "2015-01-06"
---

## Overview

Newer [hosting platforms](https://kb.apnscp.com/platform/determining-platform-version/), v6+, support multiple Ruby versions through [rvm](http://www.rvm.io). This enables you to run multiple versions of Rack and Rails using any available Ruby interpreters. Currently, versions 1.8 to 2.2 are supported.

**Important:** Avoid using 1.8, except to shim an older application with an intent to upgrade. 1.8 is [deprecated](https://www.ruby-lang.org/en/news/2011/10/06/plans-for-1-8-7/) and contains several unpatched security vulnerabilities as of June 2013.

## Switching versions

Important: all commands are done from the [terminal](https://kb.apnscp.com/terminal/accessing-terminal/).

### Listing available versions

`rvm list` will list available versions. If a version that you need is missing, open a ticket and we'll install it for you.

\[myadmin\]$ rvm list
rvm rubies
   ruby-1.8.7-head \[ x86\_64 \]
   ruby-1.8.7-p374 \[ x86\_64 \]
   ruby-1.9.3-p547 \[ x86\_64 \]
 \* ruby-2.0.0-p481 \[ x86\_64 \]
=> ruby-2.1.2 \[ x86\_64 \]
   ruby-head \[ x86\_64 \]
# => - current
# =\* - current && default
# \*  - default

Current (=>) indicates the version that will be reported with `ruby --version` and default (\*) indicates the Ruby version in effect upon login _without_ issuing `rvm use`.

### Setting versions

To use a Ruby version for the life of the session, issue `rvm use ruby-ver` where ruby-ver is the ruby version:

\[myadmin\]$ rvm use ruby-head
ruby-head - #gemset created /home/myadmin/.rvm/gems/ruby-head
ruby-head - #importing gemsetfile /.socket/ruby/gemsets/default.gems evaluated to empty gem list
ruby-head - #generating default wrappers.............
Using /home/myadmin/.rvm/gems/ruby-head

If Rubygems hasn't been initialized yet for the given version, then gems will be populated. Use `rvm use --default ruby-ver` to set the default version for future logins.

Note: `rvm list` will report a different default from current. Default, _in this context_, indicates server default and not the default set via `rvm use`.

### Setting versions as default

A Ruby version can be configured as the default for a directory and its descendents by adding the Ruby version via `.ruby-version`. For example, to set Ruby 2.2.4 as the default interpreter under /var/www and its descendents, including /var/www/myapp, /var/www/domain2.com/app1, and /var/www/domain2.com/app2, create a file named `/var/www/.ruby-version` with "ruby-2.2.4":

echo "ruby-2.2.4" > /var/www/.ruby-version
ruby -v
# Ruby version will be system default
cd /
# Leave /var/www
cd /var/www
# Ruby version now queried from /var/www/.ruby-version
ruby -v
# Ruby version will output ruby 2.2.4p230

## See also

- KB: [Setting up Rails with Passenger](https://kb.apnscp.com/ruby/setting-rails-passenger/)
