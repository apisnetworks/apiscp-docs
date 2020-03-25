---
title: "Installing Express"
date: "2015-03-17"
---

## Overview

[Express](http://expressjs.com/) is a Node.js framework inspired by Sinatra for Ruby: it's based on minimalism with a penchant for performance. Express is part of the [MEAN](http://mean.io) fullstack: **M**ongoDB, **E**xpress, **A**ngular.js, and **N**ode.js. MongoDB may be setup in a [separate guide](https://kb.apnscp.com/guides/running-mongodb/).

Express is supported on all [v6+](https://kb.apnscp.com/platform/determining-platform-version/) platforms using Passenger to manage isolated processes.

## Quickstart

All steps are done from the [terminal](https://kb.apnscp.com/terminal/accessing-terminal/):

1. PREREQUISITE: create a Passenger-compatible [filesystem layout](https://kb.apnscp.com/cgi-passenger/passenger-application-layout/)
    - In this example, our app will reside in `/var/www/express`. The filesystem layout looks like:
        
        express
        ├── app.js
        ├── public
        │   └── .htaccess
        └── tmp
        
2. From the root directory, `/var/www/express`, install Express locally with [npm](https://kb.apnscp.com/guides/running-node-js/#npm):
    - npm install express
        
3. Now create a startup file named `app.js` within `express/`. Copy and paste the following as a sample application in the root folder:
    
    var express = require('express')
    var app = express()
    
    app.get('/', function (req, res) {
     res.send('Hello World!');
    })
    
    var server = app.listen(3000, function () {
     var host = server.address().address
     var port = server.address().port
    
     console.log('Example app listening at http://%s:%s', host, port)
    })
    
4. Inform Passenger that the app should be launched as Node.js application
    
    echo "PassengerNodejs /usr/bin/node" > public/.htaccess
    
5. Lastly, connect `public/` to a [subdomain](https://kb.apnscp.com/web-content/creating-subdomain/) within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/)
6. _**Enjoy!**_

### Using Express Generator

Express Generator is a separate application to facilitate filesystem creation for an app. It may be installed separately from npm:

npm install -g express-generator

Now run `express <appname>` where _appname_ is a new app to create, e.g. `cd /var/www && express express` to create a new app located in `/var/www/express`. The application, `express`, will scaffold a new filesystem layout that is [compatible](https://kb.apnscp.com/cgi-passenger/passenger-application-layout/) with Passenger.

Change directories to the newly-created app root, and run `npm install` to install dependencies.

**Note: **astute readers will note that `npm` is invoked first without `-g`, then with `-g`. -g is a flag that installs the package globally in `/usr/local`. In certain situations, where an application is loosely-coupled and serves no integral function, placing it under `/usr/local` would be better so that binaries are picked up under `/usr/local/bin`.

**Important:** once generated the _startup file_ is located as `bin/www`. `app.js` is a separate application launched after initialization. To make this work with Passenger, add `PassengerStartupFile www/bin` to `.htaccess` in `public/`.

## See also

- [Express demo](http://express.sandbox.apnscp.com/) on Sol, a v6 platform
- Express [API documentation](http://expressjs.com/api.html)
- Express guide: [Routing](http://expressjs.com/guide/routing.html) (start here and continue onward)
