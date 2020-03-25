---
title: "Adding pretty-print URLs"
date: "2015-01-28"
---

## Overview

Pretty-print URLs (_permalinks_) in WordPress transform meaningless URL patterns, e.g. _index.php?page\_id=123_ into meaningful URLs, like _/wordpress/adding-pretty-print-urls_. Navigation is easier to view in the browser, plus it helps with SEO. Enabling pretty-print is a two-part process, add a few lines to your [.htaccess](https://kb.apnscp.com/guides/htaccess-guide/) and configure the display style in WordPress.

\[caption id="attachment\_610" align="alignnone" width="300"\][![Permalinks before and after as seen in the browser.](https://kb.apnscp.com/wp-content/uploads/2015/01/permalinks-before-after-300x49.gif)](https://kb.apnscp.com/wp-content/uploads/2015/01/permalinks-before-after.gif) Permalinks before and after as seen in the browser.\[/caption\]

## Solution

1. Create a [.htaccess](https://kb.apnscp.com/guides/htaccess-guide/) file inside the [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/) for your WordPress site if it does not already exist.
2. Add the following lines to the `.htaccess` file
    
    <IfModule mod\_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\\.php$ - \[L\]
    RewriteCond %{REQUEST\_FILENAME} !-f
    RewriteCond %{REQUEST\_FILENAME} !-d
    RewriteRule . /index.php \[L\]
    </IfModule>
    
    - **Files** > **File Manager** works well for performing a quick edit on this file
3. Login to your WordPress admin portal, typically `/wp-admin`, e.g. http://example.com/wp-admin
4. Visit **Settings** > **Permalinks** to choose a permalink structure under Common Settings
    - we use a **custom structure** with the value `` `/%category/%postname%/` `` since multiple categories could contain the same post title
        
        \[caption id="attachment\_587" align="alignnone" width="300"\][![Custom permalink used on kb.apnscp.com.](https://kb.apnscp.com/wp-content/uploads/2015/01/permalink-value-apis-300x59.png)](https://kb.apnscp.com/wp-content/uploads/2015/01/permalink-value-apis.png) Custom permalink used on kb.apnscp.com.\[/caption\]
5. Click **Save Changes**

 

## See also

- WordPress Codex: [Using Permalinks](http://codex.wordpress.org/Using_Permalinks)
