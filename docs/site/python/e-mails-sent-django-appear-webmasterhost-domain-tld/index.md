---
title: "E-mails sent from Django appear as webmaster@host.domain.tld"
date: "2015-03-06"
---

## Overview

E-mails sent from a Django application may use "webmaster@host.domain.tld" or another erroneous address as the _From_ field.

## Cause

[ServerAdmin](http://httpd.apache.org/docs/current/mod/core.html#serveradmin) values are not set in Apache configuration for virtual hosts to prevent unintentional information leakage.

## Solution

Set `DEFAULT_FROM_EMAIL` and `SERVER_EMAIL` in your Django [settings file](https://docs.djangoproject.com/en/1.7/topics/settings/). An example configuration follows:

EMAIL\_HOST='localhost'
EMAIL\_PORT='587'
EMAIL\_HOST\_USER='myadmin@mydomain.com'
EMAIL\_PASSWORD='mysmtppassword'
DEFAULT\_FROM\_EMAIL=EMAIL\_HOST\_USER
SERVER\_EMAIL=EMAIL\_HOST\_USER

Replace `EMAIL_HOST_USER` and `EMAIL_PASSWORD` values with your correct [e-mail credentials](https://kb.apnscp.com/e-mail/accessing-e-mail/).

## See also

- [Django documentation: Settings](https://docs.djangoproject.com/en/1.7/ref/settings/)
