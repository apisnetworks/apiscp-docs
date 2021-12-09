---
title: "Redirecting on typo"
date: "2014-10-31"
---

[mod\_speling](http://httpd.apache.org/docs/trunk/mod/mod_speling.html) may be used to correct typos in URLs. Spelling rules only allow one character translation (i.e. character capitalization, transposition, or omission) and ignores extensions such as _.html_. To enable spell-checking, add the following line to your .htaccess file:

```
CheckSpelling On
```
