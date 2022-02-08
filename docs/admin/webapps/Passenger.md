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

## Direct proxy

An application may wire in additional services that make automatic startup/shutdown by Passenger cumbersome, such as [Discourse](Discourse.md). A Passenger-based application can be manually started, then connected to using [mod_rewrite](https://httpd.apache.org/docs/2.4/mod/mod_rewrite.html).

If an application is running on port 8082, then the following rules in the *document root* of the subdomain or domain will suffice:

```
DirectoryIndex disabled
RequestHeader set X-Forwarded-Proto expr=%{REQUEST_SCHEME}

RewriteEngine On
# This may be removed to send ALL requests to the app
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]

RewriteCond %{HTTP:Connection} =upgrade [NC]
RewriteCond %{HTTP:Upgrade} =websocket [NC]
RewriteRule ^(.*)$ ws://localhost:8082/$1 [L,QSA,P]
RewriteRule ^(.*)$ http://localhost:8082/$1 [L,QSA,P]
```

First, no [directory index](https://httpd.apache.org/docs/2.4/mod/mod_dir.html#directoryindex) will be assumed (index.html, index.php) for the location.

The request scheme (http, https) is passed to the proxy as X-Forwarded-Proto. This standard, recognized in [RFC 7239](https://datatracker.ietf.org/doc/html/rfc7239), informs the application if the request was made securely.

If the request matches a file in the document root, such as media or JavaScript, then that file is served directly. 

If the client solicits a request to upgrade to WebSockets, then the ws protocol is used.

Otherwise the request is sent locally, unencrypted, to the application listening on port 8082.

### Standalone mode

Passenger includes a [standalone mode](https://www.phusionpassenger.com/library/config/standalone/intro.html) that facilitates launching an application directly, such as in the case of [Discourse](Discourse.md). Standalone mode is controlled using `Passengerfile.json` typically located in the *application root* for the app.

Use of this requires the `passenger` gem in [Ruby](Ruby.md).

```bash
gem install passenger
```

The following annotated configuration illustrates how it comes together. The *document root* is /var/www/forums/public while the *application root* is /var/www/forums.

See "[Configuration reference](https://www.phusionpassenger.com/library/config/standalone/reference/)" for a comprehensive listing of directives.

```json
{
    /* Use rbenv shim loader, allows .ruby-version per-directory */
    "ruby": "/usr/local/share/ruby/rbenv/shims/ruby",
    /* can be node, wsgi, rack, or meteor */
    "app_type": "rack",
    "startup_file": "/var/www/forums/config.ru",
    "environment": "production",
    // Use Rack, bundled with Discourse as the HTTP server
    "engine": "builtin",
    // Statically set 6 workers at all times.
    "min_instances": 6,
    "max_pool_size": 6,
    "daemonize": true,
    "spawn_method": "smart",
    // Listen on 127.0.0.1:40011
    "address": "127.0.0.1",
    "port": 40011,
    // Necessary for reliable WebSocket operation in Ruby
    "force_max_concurrent_requests_per_process": 0,
    // Additional env variables to pass to Ruby at startup
    "envvars": {
        "RUBY_GC_HEAP_GROWTH_MAX_SLOTS": "40000",
        "RUBY_GC_HEAP_INIT_SLOTS": "400000",
        "RUBY_GC_HEAP_OLDOBJECT_LIMIT_FACTOR": "1.5",
        "LD_PRELOAD": "/usr/lib64/libjemalloc.so.1"
    }
}
```

Once configured it may be started using `passenger start` and stopped using `passenger stop`.

### See also

* [Configuration reference for Passenger + Apache](https://www.phusionpassenger.com/library/config/apache/reference) (phusionpassenger.com)
