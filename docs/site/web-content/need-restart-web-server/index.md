---
title: "I need to restart the web server..."
date: "2015-03-05"
---

## Overview

During certain situations you may become confused with what is wrong with your site. For example, moving WordPress or Drupal to another location or even misplacing files on your web site may lead to an erroneous conclusion that the web server must be "restarted" to clean its cache or memory usage.

### When is a manual restart necessary?

The following is an all-inclusive list of when an optional web server restart may be necessary:

_<this list intentionally left blank>_

### When is a restart automated?

Certain operations within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) may necessitate a restart or reload of the web server. During this time, configuration is rebuilt and requests are temporarily queued. A restart happens automatically in the control panel whenever these conditions are met:

- Domain name is changed under **Account** > **Settings**
    - web server must update the ServerName configuration with the new domain
- A new addon domain is added via **DNS** > **Addon Domains**
    - web server must add the domain to its list of known hosts for a given virtual host
- A SSL certificate is installed or updated via **Web** > **SSL Certificates**
    - web server must update its configuration to send the new SSL certificate for https requests

No other condition will trigger a web server restart and no restart is necessary for any other operation, _including_ adding a subdomain via **Web** > **Subdomains**.

### A list of common problems and solutions

Peruse the list of common issues that are mistakenly interpreted as a need to restart the web server:

- [Where to upload web site files](https://kb.apnscp.com/web-content/where-is-site-content-served-from/)
- [Moving WordPress locations](http://codex.wordpress.org/Moving_WordPress#Moving_Directories_On_Your_Existing_Server)
- [Moving Drupal locations](https://www.ostraining.com/blog/drupal/move-drupal-to-a-new-folder/)
- [Moving phpBB and old connection details are used](https://www.phpbb.com/support/docs/en/3.0/kb/article/purging-the-phpbb-cache/)
