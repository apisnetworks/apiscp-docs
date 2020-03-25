---
title: "Migrating mail from elsewhere"
date: "2015-10-07"
---

## Overview

When migrating from a previous hosting provider or even consolidating user accounts, it may be necessary to incorporate email from elsewhere into your account. This can be achieved through a variety of ways, from easiest to most cumbersome.

## Migration techniques

### SquirrelMail Fetchmail

SquirrelMail, a webmail client available within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) via **Mail** > **Webmail**, or through http://_<[server name](https://kb.apnscp.com/platform/what-is-my-server-name/)\>_/webmail includes support to download mail from a remote server and merge it with your inbox. To get started:

1. Login to SquirrelMail per the [correct location](https://kb.apnscp.com/e-mail/changing-webmail-locations/); universally, it will be accessible via http://<s_[erver name](https://kb.apnscp.com/platform/what-is-my-server-name/)_\>/webmail
    - Can't login? Check your [credentials](https://kb.apnscp.com/e-mail/accessing-e-mail/).
2. Once logged in, go to **Options** > **POP3 Fetchmail**
3. Enter your credentials of your old mail server
    - If migrating from a hosting provider, use your old mail server IP address. Often times this is just the hostname of your old host or old cPanel address.
    - When in doubt, contact your old hosting provider to request the "IMAP/POP3 server IP address".
    - **_Optionally,_** to make this continuous, i.e. letting SquirrelMail act as an aggregate email collector, select "_Check mail at login_"
4. Click ******Add Server******
    
    \[caption id="attachment\_1108" align="aligncenter" width="300"\][![Sample dialog entry in SquirrelMail](https://kb.apnscp.com/wp-content/uploads/2015/10/fetchmail-dialog-300x90.png)](https://kb.apnscp.com/wp-content/uploads/2015/10/fetchmail-dialog.png) Sample dialog entry in SquirrelMail\[/caption\]
5. Return to the inbox overview, then click on **Fetch** to begin downloading email
    
    \[caption id="attachment\_1112" align="aligncenter" width="300"\][![Fetch action present after configuring a server to download from.](https://kb.apnscp.com/wp-content/uploads/2015/10/fetchmail-fetch-action-300x27.png)](https://kb.apnscp.com/wp-content/uploads/2015/10/fetchmail-fetch-action.png) Fetch action present after configuring a server to download from.\[/caption\]
    
     

### Direct copy

If coming from another provider that stores email in a Maildir or Maildir++ format, i.e. _each message resides in a separate file and email is stored in a folder called "`cur/`"_, then these files may be copied directly over. Messages will be picked up automatically by the mail server and incorporated into your existing mailbox(es). Messages for a user should be copied into `Mail/cur/` located within that user's [home directory](https://kb.apnscp.com/platform/home-directory-location/). For a discussion on mailbox layout, see KB: [Email filesystem layout](https://kb.apnscp.com/e-mail/email-filesystem-layout/).
