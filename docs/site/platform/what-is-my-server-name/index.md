---
title: "What is my server name?"
date: "2014-11-03"
---

## Overview

Your server name is the server on which you are hosted. Your server name can be ascertained in a few different ways:

- Visit [Server Lookup](http://apnscp.com/server-lookup). Enter your domain name.
    - _In rare situations, a domain may exist on more than 1 server during a server migration in process. See alternative solutions below:_
- Login to the control panel via https://apnscp.com > **CP Login**. You will be redirected to a URL of the form http://cp._<server>_.apnscp.com.
    - Alternatively, access http://_<domain>_/cpadmin where _<domain>_ is your domain name. You will be redirected to http://cp._<server>_.apnscp.com.
- Perform a DNS lookup on your domain. An IP address will be returned. Perform a rDNS to find the server name.
    1. Visit [http://whois.sc](http://whois.sc)
    2. Enter your domain name in "WHOIS LOOKUP"
    3. Take this numeric value of the form aaa.bbb.ccc.ddd, e.g. 64.22.68.1. This is your _IP address_.
    4. Visit a [reverse DNS lookup utility](http://www.dnsqueries.com/en/reverse_lookup.php), enter your _IP address_ in the field.
    5. Right-hand value in the lookup result is your server. It will be of the form _xxx._apnscp.com where _xxx_ is your server.
- Should all else fail, contact support via [help@apnscp.com](mailto:help@apnscp.com)

 

 

\[caption id="attachment\_141" align="alignnone" width="300"\][![Control panel login location via apnscp.com](https://kb.apnscp.com/wp-content/uploads/2014/11/cp-login-location-300x48.png)](https://kb.apnscp.com/wp-content/uploads/2014/11/cp-login-location.png) Control panel login location via apnscp.com\[/caption\]
