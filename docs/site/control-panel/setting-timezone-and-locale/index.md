---
title: "Setting timezone and locale"
date: "2016-08-13"
---

## Overview

Timezone and locale may be changed for the active user within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) via **Account** > **Settings** > Localization. Any timezone changes will be inherited by [terminal applications](https://kb.apnscp.com/terminal/accessing-terminal/) and one-click applications created following adjustment. Other PHP applications will need to be adjusted on a case-by-case basis.

## Changing timezones in PHP applications

A timezone may be set for a PHP application within the control panel.

1. Visit **Web** > **.htaccess Manager**.
2. Select the hostname to adjust, if the app resides in a folder under the domain, select _Edit Subdir_.
3. Select **PHP** for _Personality_
4. Select **php\_value** for _Directive_
5. Under **Value** enter `date.timezone _TIMEZONE_` where _TIMEZONE_ follows an [Olson-compatible](https://en.wikipedia.org/wiki/Tz_database) timezone.
    - All valid timezones are listed under **Account** > **Settings** > **Localization** \> **Timezone**
    - Olson format uses regional major cities instead of timezone names to configure timezone and latitude/longitude.
    - Example: set timezone to PST/PDT, `date.timezone America/Los_Angeles`
    - Example: set timezone to GMT, use London: `date.timezone Europe/London`
6. Click **Add** to add the directive
7. Click **Save Changes** to commit changes

\[caption id="attachment\_1337" align="aligncenter" width="1167"\][![Setting default timezone for a given PHP application within the control panel .htaccess manager.](https://kb.apnscp.com/wp-content/uploads/2016/08/timezone-config-php.png)](https://kb.apnscp.com/wp-content/uploads/2016/08/timezone-config-php.png) Setting default timezone for a given PHP application within the control panel .htaccess manager.\[/caption\]

### Failed timezone change

If the timezone change is not reflected in the application, then it sets timezone at runtime. These applications will provide a configuration option to make timezone changes. Check with your application documentation for assistance.

## See also

- [List of supported timezones](http://php.net/manual/en/timezones.php) (PHP.org)
