---
title: "Running Node.js"
date: "2015-01-16"
---

## Overview

[Node.js](http://nodejs.org/) is a performant JavaScript backend built off Chrome's JavaScript engine ([v8](http://code.google.com/p/v8/)). It's also wicked fast. Node.js and its accompanying package management, [npm](https://www.npmjs.com/), are available on [newer platforms](https://kb.apnscp.com/platform/determining-platform-version/) (v6+) without any [additional compilation](https://kb.apnscp.com/terminal/compiling-programs/) from source. Accounts [with terminal access](https://kb.apnscp.com/terminal/is-terminal-access-available/) are eligible to use Node.js and npm.

## Running Node.js with Passenger

Newer hosting servers, [v6+ and above](https://kb.apnscp.com/platform/determining-platform-version/), support running Node.js through Passenger. Passenger automatically manages launching Node.js and scaling the number of Node.js instances to meet demand. To adapt a Node.js script to Passenger, create a [compatible](https://kb.apnscp.com/cgi-passenger/passenger-application-layout/) filesystem layout:

nodejsapp
+-- app.js  <-- main file
+-- public  <-- document root
¦   +-- .htaccess <-- htaccess control file
+-- tmp     <-- passenger control/scratch directory

Create a [.htaccess](https://kb.apnscp.com/guides/htaccess-guide/) file in `public/`, which serves as the [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/), with the following lines:

PassengerNodejs /usr/bin/node

**Note** (_[v6.5+ platforms](https://kb.apnscp.com/platform/determining-platform-version/)_): if the system version is insufficient, use [nvm](https://kb.apnscp.com/node/changing-node-versions/) to specify or install a different Node interpreter. When specifying the path to `PassengerNodejs`, be sure to expand the tilde (~) to your [home directory](https://kb.apnscp.com/platform/home-directory-location/).

**Note:** (_v6 platforms_) if the system version is insufficient, you may use your own Node.js version installed under /usr/local/bin. Change _PassengerNodejs_ from `/usr/bin/node` to `/usr/local/bin/node`.

Next, rename the main file to `app.js` and locate this under public/ as in the directory layout. Connect the public/ folder to a subdomain or domain within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) and you're all set. You can specify another entry-point via the _PassengerStartupFile_ directive.

You can restart Node.js using the same [restart mechanism](https://kb.apnscp.com/ruby/restarting-passenger-processes/) as with Ruby or Python scripts.

### Specifying another startup

In the .htaccess file, specify: `PassengerStartupFile _newfile.js_` where _newfile.js_ is the location to another file not named app.js.

## Running Node.js standalone

### Quickstart

The following lines of code should be added to a file called `server.js`. Replace `40201` with a [port preallocated](https://kb.apnscp.com/terminal/listening-ports/) to your account.

// Load the http module to create an http server.
var http = require('http');

// Configure our HTTP server to respond with Hello World to all requests.
var server = http.createServer(function (request, response) {
 response.writeHead(200, {"Content-Type": "text/plain"});
 response.end("Hello World\\n");
});

// Listen on port 40201, pre-allocated , IP defaults to 127.0.0.1
server.listen(40201);

// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:40201/");

A quick and easy way to do this is with Vim, a text-editor available through the terminal:

1. `vim ~/myserver.js`
2. Type `i` on the keyboard to switch to "Insert" mode
    - Depending upon client, paste the text through CTRL + V, Shift + INS, or a suitable key combination
3. Hit the Esc(ape) key.
4. Type `:wq`
5. _Done!_

Now to start Node.js using the above server script, type: `node ~/server.js:`

`[myuser ~]$ node server.js Server running at http://127.0.0.1:40201/`

Congratulations! Your Node.js server is running. You can send a simple request using [curl](http://apnscp.com/linux-man/man1/curl.1.html) with `curl http://127.0.0.1:40201/` to confirm everything is working:

`[myuser ~]$ curl http://127.0.0.1:40201 Hello World!`

### Persisting a server

Use [forever](https://www.npmjs.com/package/forever) through npm (`npm install -g forever`) or [nohup](http://apnscp.com/linux-man/man1/nohup.1.html) to run keep a server running even after logging out: `nohup node server.js &`

### Starting on Start-up

1. Visit **Dev** > **Task Scheduler** within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) to schedule a new task.
2. Under **Command**, enter `node ~/server.js`
3. Under _Scheduling_, select **Server Start**
4. Click **Add**

## Installing packages

Use npm to install packages. Syntax is of the form `npm install -g PKGNAME` where _PKGNAME_ is a package [listed through npm](https://www.npmjs.com/).

### Configuring global install on older platforms

Platforms [older than v6](https://kb.apnscp.com/platform/determining-platform-version/) will require a [.npmrc](https://docs.npmjs.com/files/npmrc) file present within the home directory to define 2 variables, `prefix` and `link`. These 2 variables will set the location in which binaries are installed and make a link so the binary appears in your shell path:

prefix = /usr/local
link = yes

Once this file is present in your home directory with those 2 lines, then `node install -g` will properly install packages under `/usr/local` instead of within the current working directory.

## See also

- [npm package repository](https://www.npmjs.com/)
- [Node.js documentation](http://nodejs.org/api/)
- [The Node Beginner Book](http://www.nodebeginner.org/)
- [Node.js launched with Passenger on a v6 platform](http://nodejs.futz.net)
