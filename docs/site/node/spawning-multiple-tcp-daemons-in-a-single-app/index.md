---
title: "Spawning multiple TCP daemons in a single app"
date: "2016-01-13"
---

## Overview

Node applications may bind to a TCP port using `[listen](https://nodejs.org/api/net.html#net_server_listen_port_hostname_backlog_callback)(_<PORT NUMBER>_)`, provided of course the _PORT NUMBER_ is one [allocated](https://kb.apnscp.com/terminal/listening-ports/) to your account. Passenger replaces this listen() method with a [built-in method](https://github.com/phusion/passenger/blob/stable-5.0/src/helper-scripts/node-loader.js) that, instead of listening on a TCP port, creates a local UNIX socket for communication with the web server (_see `installServer()` in [source](https://github.com/phusion/passenger/blob/stable-5.0/src/helper-scripts/node-loader.js)_).

By creating a socket, no TCP ports are consumed, traffic may only be accessed from within the server, and the server must know the socket path. This is great for security, but if an app spawns another process, like a [Socket.IO](https://www.npmjs.com/package/socket.io), that also calls listen(), then the app fails with:

> App 28096 stderr: Error: http.Server.listen() was called more than once, which is not allowed because Phusion Passenger is in auto-install mode. This means that the first http.Server object for which listen() is called, is automatically installed as the Phusion Passenger request handler. If you want to create and listen on multiple http. Server object then you should disable auto-install mode.

## Cause

[listen](https://nodejs.org/api/net.html#net_server_listen_port_hostname_backlog_callback)() is overwritten to create a UNIX socket to communicate with the HTTP server, instead of a TCP socket. This obviates the need to use a proxy passthru to Node applications, but carries a limitation of only 1 listen() invocation per application.

## Solution

Configure PhusionPassenger to disable overwriting listen() via `autoInstall: false`  and use the special port, "`passenger`", to create a UNIX socket for the application that serves to handle application requests. Any subsequent daemon spawned, for example a backend job service, may operate without modification:

var http = require('http'),
 httpProxy = require('http-proxy');

// disable implicit listen() overwrite
if (typeof(PhusionPassenger) != 'undefined') {
 PhusionPassenger.configure({ autoInstall: false });
}

// explicitly listen on a Passenger socket for communication with the
// web server
httpProxy.createServer(9000, 'localhost').listen('passenger');

// create a second server on port 9000; this port should be a port
// allocated to your account
var target\_server = http.createServer(function (req, res) {
 res.writeHead(200, { 'Content-Type': 'text/plain' });
 res.write('request successfully proxied!' + '\\n' + JSON.stringify(req.headers, true, 2));
 res.end();
}).listen(9000);

## See also

- [Phusion Passenger Error: http.Server.listen() was called more than once](http://stackoverflow.com/questions/20645231/phusion-passenger-error-http-server-listen-was-called-more-than-once/20645549) (StackOverflow)
