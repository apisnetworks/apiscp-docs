# Passenger apps

Passenger is an embedded server that assists in securely managing [Node](Node.md), [Python](Python.md), and [Ruby](Ruby.md) apps. Passenger may launch directly from Apache, proxy through to a separate Nginx server, or proxy through to itself in standalone mode.

## Configuration

An [.htaccess](https://kb.apnscp.com/guides/htaccess-guide/) file instructs Apache how to map this request. Passenger applications must be explicitly defined 

A few directives are used. **All directives below are prefixed with Passenger**. Values specified as `this` are to be taken literally.

| Directive   | Values                                    | Description                                                  |
| ----------- | ----------------------------------------- | ------------------------------------------------------------ |
| Enabled     | `on`                                      | Enable Passenger support                                     |
| AppRoot     | *path*                                    | Required when StartupFile is not located in .htaccess directory. |
| StartupFile | *path*                                    | Entry script relative to app root                            |
| AppType     | `node`, `python`, or `ruby`               | Application type                                             |
| Nodejs      | optional full path to `node` executable   | Used when AppType is `node`                                  |
| Python      | optional full path to `python` executable | Used when AppType is `python`                                |
| Ruby        | optional full path to `ruby` executable   | Used when AppType is `ruby`                                  |
| FriendlyErrorPages | default is `on`, `off` hides errors| Shows errors in browser. Set to `off` for production.        |

Integrating these facts above let's install Nodejs 12.16.3, on a subdomain whose [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/) is `/var/www/hq/public`. The application resides in `/var/www/hq` and its entry script (startup file) is `/var/www/hq/current/index.js`.

First, determine which Node, Python, or Ruby interpreter you'd like to use. 

```bash
# Install Nodejs v12.16.3
nvm install 12.16.3
# Get the path to this file
nvm which 12.16.3
# Returns "/home/myadmin/.nvm/versions/node/v12.16.3/bin/node"
```

Lastly, create a `.htaccess` file in `/var/www/hq/public` with the following lines:

```
PassengerEnabled on
PassengerStartupFile current/index.js
PassengerAppType node
PassengerAppRoot /var/www/hq
PassengerNodejs /home/myadmin/.nvm/versions/node/v12.16.3/bin/node
```

## Restarting

Create a directory named `tmp` within the application root. touch either file to restart one time or before every request:

| File               | Purpose                     |
| ------------------ | --------------------------- |
| restart.txt        | Restart once                |
| always_restart.txt | Restart before each request |

```bash
cd /var/www/ghost
mkdir tmp
touch tmp/restart.txt
```

Passenger will restart automatically once the timer has elapsed (~2 minutes).

## Idle shutdowns

All apps spindown processes if no activity is received after a fixed time (5 minutes). This behavior is consistent with PHP-FPM pool management. Unlike PHP however, there is no warm cache to resume code from making initialization sometimes expensive.

Global idle shutdown may be modified by overriding `PassengerPoolIdleTime` in `/etc/httpd/conf/httpd-custom.conf` (see [Apache.md](Apache.md#configuration)).

```
# Disable idle shutdowns
PassengerPoolIdleTime 0
```

### See also

* [Configuration reference for Passenger + Apache](https://www.phusionpassenger.com/library/config/apache/reference) (phusionpassenger.com)
