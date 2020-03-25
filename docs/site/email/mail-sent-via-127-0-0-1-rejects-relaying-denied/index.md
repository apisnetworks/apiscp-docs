---
title: "Mail sent via 127.0.0.1 rejects with "Relaying Denied""
date: "2016-10-24"
---

## Overview

Email that is sent over TCP via 127.0.0.1 or the server IP address is rejected with a "521: Relaying Denied" error message.

## Cause

All email that passes through TCP must be authenticated with a SASL-compatible [username and password](https://kb.apnscp.com/email/accessing-e-mail/), which is the login/password used to access email on the server.

## Solution

SASL authentication is necessary to track abuse and prevent unauthenticated users from relaying mail over TCP that the SMTP service cannot trace the initiating UID. Mail that passes through sendmail, for example through the PHP [mail()](http://php.net/mail) command, do not carry this requirement as the UID and originating script are logged.

### Authentication Settings

#### PHPMailer

$mail \= new PHPMailer;

$mail\->isSMTP();                                      // Set mailer to use SMTP
$mail\->Host \= '127.0.0.1';                            // Specify main and backup SMTP servers
$mail\->SMTPAuth \= true;                               // Enable SMTP authentication
$mail\->Username \= 'user@example.com';                 // SMTP username
$mail\->Password \= 'secret';                           // SMTP password
$mail\->SMTPSecure \= 'tls';                            // Enable TLS encryption, \`ssl\` also accepted
$mail\->Port \= 587;                                    // TCP port to connect to

#### WordPress

Use [WP SMTP Mail](https://wordpress.org/plugins/wp-mail-smtp/) or continue to use WordPress' built-in mailer without incident.

#### Ruby on Rails

via config/environments/$RAILS\_ENV.rb:

`config.action_mailer.delivery_method =` `:smtp`

`config.action_mailer.smtp_settings = {`

`address:` `'127.0.0.1'``,`

`port:` `587``,`

`domain:` `'example.com'``,`

`user_name:` `'user@example.com'``,`

`password:` `'secret'``,`

`authentication:` `'plain'``,`

`enable_starttls_auto:` `true``}`

## See also

- KB: [Accessing email](https://kb.apnscp.com/email/accessing-e-mail/)
