---
title: "Optimal W3 Total Cache settings"
date: "2015-01-26"
---

## Overview

[W3 Total Cache](https://wordpress.org/plugins/w3-total-cache/) is a comprehensive caching plugin for WordPress that will dramatically speed up pageviews and consolidate page requests. WordPress works faster, and people who visit your page can do more in less time, with no downsides. It works so well, it is even used on this knowledgebase, kb.apnscp.com.

## Installing

1. Login to your WordPress admin portal, typically domain + `/wp-admin`
    - e.g. `http://example.com/wp-admin` if the domain is `example.com`
2. Navigate to **Plugins** > **Add New**
    
    \[caption id="attachment\_567" align="alignnone" width="300"\][!["Add New" location underneath Plugins](https://kb.apnscp.com/wp-content/uploads/2015/01/wordpress-plugin-location-300x143.png)](https://kb.apnscp.com/wp-content/uploads/2015/01/wordpress-plugin-location.png) "Add New" location underneath Plugins\[/caption\]
3. Within the Search bar, enter _W3 Total Cache_
4. Click **Install Now**
5. Enter your FTP password or [login information](https://kb.apnscp.com/ftp/accessing-ftp-server/) to install the plugin securely through FTP
    - Specify `localhost` for **Hostname**
        - Traffic will stay local on the server adding an extra layer of privacy
    - Need to [reset your password?](https://kb.apnscp.com/control-panel/resetting-your-password/)
6. Click **Activate** once installed to activate this plugin

## Configuring

### Automatic

1. Under **Performance** > **General Settings** > **Import/Export**, select **Import configuration**.
2. Extract `w3-settings.php` from the attached zip file, select this file.
    - [Download w3-settings.zip](https://kb.apnscp.com/wp-content/uploads/2015/01/w3-settings.zip) (sha256: `cce8cbc6a210a8cbde05b86d3b252a930f0396877eb4b6727ec1939fe5d202f0`)
    - Note: minification is enabled for logged-in users. If making changes to your theme, disable this feature via **General Settings** > **Minify** > Disable for logged in users **enable**.
3. Click **Upload**
4. Upon success, "_Settings successfully uploaded_" will appear up top confirming install success.
    
    \[caption id="attachment\_569" align="alignnone" width="300"\][![W3 Total Cache import success confirmation dialog.](https://kb.apnscp.com/wp-content/uploads/2015/01/w3-import-success-300x55.png)](https://kb.apnscp.com/wp-content/uploads/2015/01/w3-import-success.png) W3 Total Cache import success confirmation dialog.\[/caption\]

### Manual

Unless explicitly stated, all other values should remain unchecked or default setting.

- Under General Settings:
    - Page cache **enable**
    - Page cache method **Disk: Enhanced**
    - Minify **enable**
    - Minify cache method **disk**
    - Database cache **enable**
    - Database cache method **disk**
    - Object cache **enable**
    - Object cache method **disk**
    - Browser cache **enable**
    - Verify rewrite rules **enable**
- Under Minify:
    - Rewrite URL structure **enable**
    - Disable minify for logged in users **enable**
    - HTML minify setting **disable**
    - JS minify **enable**
    - JS minify operation **combine only** +**non-blocking using "async"**
    - CSS minify setting **enable**
    - CSS minify **combine only**

Discussion: of particular interest is combining JavaScript and CSS files that ship with plugins to reduce the total number of HTTP requests in turn decreasing page load time. Minification of JavaScript and CSS is typically done by the vendor. Although it can be enabled, on low traffic sites the overhead incurred on the first-run, which compresses JavaScript/CSS, would be too significant: once a cache expires, it would recompile. If a user views a site every hour, a user has roughly a 50/50 chance of increased page load times while the scripts are recompressed. 

Disk cache is preferred over APC/OPCache, because whenever the HTTP server is restarted to load new addon domain changes, the APC/OPCache is purged. Any cached files then would be lost. _On high traffic sites_, APC/OPCache would yield better performance by bypassing a file stat() and instead pulling from the cache from memory.

An analysis from [webpagetest.org](http://webpagetest.org) illustrates the performance gains before and after using W3 Total Cache. First byte time is reduced (processing the request) + number of requests has been reduced as well. A post processes 36% faster, and the page loads external assets (CSS/JS) 3.7% faster. With more plugins, the performance gains become greater when W3 Total Cache is activated.

\[caption id="attachment\_570" align="aligncenter" width="640"\][![Page loads before and after caching on kb.apnscp.com.](https://kb.apnscp.com/wp-content/uploads/2015/01/caching-before-and-after-1024x540.png)](https://kb.apnscp.com/wp-content/uploads/2015/01/caching-before-and-after.png) Page loads before and after caching on kb.apnscp.com.\[/caption\]

## See also

- [W3 Total Cache FAQ](https://wordpress.org/plugins/w3-total-cache/faq/)
