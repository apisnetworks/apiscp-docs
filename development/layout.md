---
layout: docs
title: apnscp Structure
group: development
---

    .
    |-- apps
    |   `-- custom
    |-- bin
    |   |-- hooks
    |   |-- php-bins
    |   `-- scripts
    |-- build
    |-- conf
    |   |-- custom
    |   |   `-- templates
    |   `-- debug
    |-- lib
    |   |-- Module
    |   |   `-- Support
    |   |-- modules
    |   |   `-- surrogates
    |-- public
    |   |-- css
    |   |   `-- themes
    |   |-- fonts
    |   |-- images
    |   |   |-- apps
    |   |   |-- template
    |   |   |-- themes
    |   |   |   |-- current -> hostineer
    |   `-- js
    |-- resources
    |   |-- playbooks
    |   |   |-- plays
    |   |   `-- preflight
    |   |-- storehouse
    |   `-- views
    |-- storage
    |   |-- apps
    |   |-- cache
    |   |   `-- views
    |   |-- certificates
    |   |-- logs
    |   `-- run
    |-- sys
    |   |-- build
    |   `-- php
    `-- vendor    

* apps: built-in apps
  * custom: app overrides or add-ins
* bin
  * hooks
  * php-bins
  * scripts
* build
* conf
  * custom
    * templates
  * debug
* lib
  * Module
    * Support
  * modules
    * surrogates: module overrides or add-ins
  * public
    * css
      * themes
    * images
      * themes