---
title: "Viewing PHP settings"
date: "2015-01-04"
---

## Overview

Default PHP settings may be viewed either as a standalone page or within an application using [phpinfo()](http://php.net/phpinfo) or [ini\_get()](http://php.net/ini_get).

## Default Environment Settings

To view your default environment settings, create a file named `phpinfo.php` inside your [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/). Inside this file, include the following line:

<?php phpinfo(); ?>

Access the URL phpinfo.php from your web browser, e.g. http://example.com/phpinfo.php if your domain were example.com, to view the settings.

\[caption id="attachment\_391" align="alignnone" width="300"\][![Example phpinfo() response](https://kb.apnscp.com/wp-content/uploads/2015/01/phpinfo-example-300x288.png)](https://kb.apnscp.com/wp-content/uploads/2015/01/phpinfo-example.png) Example phpinfo() response\[/caption\]

## Application Settings

phpinfo() in a standalone script will show you the default settings for your hosting environment. Web applications like WordPress, Drupal, and Joomla! will automatically adjust settings on-the-fly with recommended settings as necessary ([error\_reporting](http://php.net/manual/en/errorfunc.configuration.php#ini.error-reporting), [display\_errors](http://php.net/manual/en/errorfunc.configuration.php#ini.display-errors), [upload\_max\_filesize](http://php.net/manual/en/ini.core.php#ini.upload-max-filesize), etc.). It's recommended to refer either to the settings panel in the web application (_see vendor's instructions_) or if it is unavailable and absolutely necessary, use ini\_get() or phpinfo() at the bottom of the script, usually index.php:

/\*\* some application code ... \*/
$page->init();
?>

<?php print "memory\_limit setting: "; ini\_get('memory\_limit'); ?>

<?php phpinfo(); ?>

**Explanation:** In the above example, 2 methods of accessing PHP settings are used: ini\_get() to get a specific single value ([memory\_limit](http://php.net/manual/en/ini.core.php#ini.memory-limit) in this case - _note_ this can't be changed except by support ticket in the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/)) and phpinfo() once again to dump the entire PHP environment. These scriptlets are inserted at the _end of the file_ after the closing PHP delimiter, `?>`.

Sometimes there is no PHP at the end of a script, but rather HTML. In those cases, ini\_get() or phpinfo() should be injected before the closing `</body>` tag:

<!--- some html ... -->
<span>Thanks for coming!</span>
<?php print "memory\_limit setting: "; ini\_get('memory\_limit'); ?>
<?php phpinfo(); ?>
</body>
</html>

## See Also

- [Changing PHP settings](https://kb.apnscp.com/php/changing-php-settings/)
