---
title: "Accessing e-mail"
date: "2014-11-05"
---

## Overview

E-mail may be accessed either through webmail within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) or remotely from a desktop client such as Outlook, Thunderbird, or Mail.

> ### Important login information
> 
> Your login will always be _user_@_domain_ for e-mail. For example, if your domain is _example.com_ and your username _myadmin_, then the proper e-mail login is `myadmin@example.com` and _not_ `myadmin`. Your password is the same password that is used to log into the control panel.
> 
> **Warning:** 3 invalid logins in a 5 minute window will result in an automatic 10 minute blacklist. During this 10 minute window, you will not be able to access the e-mail server. This is a mechanism in place to reduce the likelihood of a successful [brute-force](https://kb.apnscp.com/platform/handling-a-hijacked-account/) attempt on your account.

## Accessing via webmail

Webmail provides a convenient way to access e-mail from any web device. Webmail comes in 3 flavors that are accessible by different URLs and may be [changed](https://kb.apnscp.com/e-mail/changing-webmail-locations/) at any time. All of these webmail locations are also accessible within the control panel under **Mail** > **Webmail**.

- Horde is accessible via http://horde._<domain>_
    - Comprehensive mail client with address book, reminders, and filtering support
- SquirrelMail is accessible via http://mail._<domain>_
    - Lightweight client suitable for mobile devices
- Roundcube is accessible via http://roundcube._<domain>_
    - Lightweight client with a fluid interface

## Accessing via Desktop

E-mail will be configured automatically if your desktop client supports [Autodiscover](http://technet.microsoft.com/en-us/library/cc539114.aspx)/[Autoconfig](https://developer.mozilla.org/en-US/docs/Mozilla/Thunderbird/Autoconfiguration) protocol. Only your e-mail address is necessary to for the client to setup incoming mail server, outgoing mail server, and authentication information. Certain e-mail clients like Mail on OS X and iPhone do not support third-party automatic configuration, but rather use a [proprietary protocol](https://developer.apple.com/library/ios/featuredarticles/iPhoneConfigurationProfileRef/Introduction/Introduction.html) and [application](https://itunes.apple.com/us/app/apple-configurator/id434433123?mt=12). These devices require manual setup.

### Automatic Setup

#### Mozilla Thunderbird

Setup under [Mozilla Thunderbird](https://www.mozilla.org/en-US/thunderbird/) will succeed automatically.

1. Visit **Tools** > **Account Settings**
2. Select **Account Actions** at the bottom
    - [![account-actions-thunderbird](https://kb.apnscp.com/wp-content/uploads/2014/11/account-actions-thunderbird.png)](https://kb.apnscp.com/wp-content/uploads/2014/11/account-actions-thunderbird.png)
3. Select **Add Mail Account**
4. Enter _Your name_, _email address_, and _password_, which is the same as your [control panel password.](https://kb.apnscp.com/control-panel/resetting-your-password/)
5. Autoconfigure will succeed in detecting your settings. If autoconfig fails, skip to _**MANUAL CONFIGURATION**_ below
6. Click **Done**
7.  A security warning may pop-up. Click **I understand the risks**, then **Done**
8. Congratulations, your mail account is setup!

#### Microsoft Outlook

Setup under Microsoft Outlook will succeed automatically.

1. Visit **File** > **Add Account**
2. Ensure **E-mail Account** is selected
3. Enter _Your name_, _e-mail address_, and _password_, which is the same as your [control panel password](https://kb.apnscp.com/e-mail/accessing-e-mail/).
4. A dialog titled, "Allow this website to configure XXX server settings?" will appear
    - Additionally tick "_Don't ask me about this website again"_
5. Click **Allow**
6. A password dialog will appear. Click _Save this password in your password list_
7. Congratulations, your mail account is setup!

\[caption id="attachment\_193" align="alignleft" width="300"\][![Autoconfiguration success in Thunderbird](https://kb.apnscp.com/wp-content/uploads/2014/11/autoconf-dialog-300x264.png)](https://kb.apnscp.com/wp-content/uploads/2014/11/autoconf-dialog.png) Autoconfiguration success in Thunderbird\[/caption\]

\[caption id="attachment\_195" align="alignleft" width="300"\][![Encryption warning dialog in Thunderbird](https://kb.apnscp.com/wp-content/uploads/2014/11/encryption-warning-300x200.png)](https://kb.apnscp.com/wp-content/uploads/2014/11/encryption-warning.png) Encryption warning dialog in Thunderbird\[/caption\]

### Manual Setup

#### Mozilla Thunderbird

1. Follow the steps outlined in **Automatic Setup** above.
2. Stop at Step 5 (autoconfig success). Click **Manual Config**
3. Configure incoming mail server
    - Select **IMAP** for _Incoming_ server type
    - Enter **mail._yourdomain_** for _Server Hostname -_ substitute _yourdomain_ with your actual domain name
    - Select _Port_ **143**
    - Select **None** for _SSL_
    - Select **Normal Password** for _Authentication_
4. Configure outgoing mail server
    - Select **SMTP** for _Outgoing server type_
    - Enter **mail._yourdomain_** for _Server Hostname_ - substitute _yourdomain_ with your actual domain name
    - Select _Port_ **587**
    - Select **None** for _SSL_
    - Select **Normal Password** for _Authentication_
5. Configure your username, which is your login
    - Enter _user_@_yourdomain_ substituting _user_ with the user assigned to this e-mail account and _yourdomain_ being your actual domain name
6. Click **Done**

 

#### Other Mail Clients

Other mail clients may be setup in a similar fashion. Just keep these parameters in mind:

- Incoming and outgoing mail server are the same
    - **mail._yourdomain_** where _yourdomain_ is your domain name
        - e.g. an e-mail account for apnscp.com would use the mail server mail.apnscp.com
- Select **IMAP** for incoming e-mail server type. IMAP allows multiple devices to access your e-mail and synchronize what e-mail has been read, replied to, and deleted
- Specify port **587** for outgoing e-mail
    - Port 25 is discouraged, because mail servers relay mail through this port rather than mail clients submitting an e-mail. Likewise, ISPs typically restrict access on this port via firewall.
- Your login will always be **_user_@_yourdomain_**
- Your password will always be the [same password](https://kb.apnscp.com/control-panel/resetting-your-password/) used to [access the control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/)

## Still having problems logging in?

If all of your credentials are correct, and your connection is not being blocked after 3 invalid requests in a 5 minute window, then 1 of 3 issues are to blame:

1. Invalid password
    - Solution: login to the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) as the primary account holder. Visit **User** > **Manage Users**. Click the _Edit_ action under the **Actions** column. Enter a new password for this user.If you access e-mail as the primary account holder, _then_ you will be unable to login to the control panel if your password is invalid (e-mail and control panel use the same password source). Reset your password through the control panel [reset utility](https://kb.apnscp.com/control-panel/resetting-your-password/).
2. User denied IMAP/POP3 access
    - Solution: this only happens with secondary users on the account. A user must be privileged to access the e-mail server to receive e-mail. Login to the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) as the primary account holder.
        1. Visit **User** > **Manage Users**
        2. Verify that _mail_ is not enabled for the user. The _mail_ column will be empty.
            1. If a checkmark is present, then the user is accessing with incorrect credentials.
        3. Click the _Edit_ action under the **Actions** column.
        4. Enable **E-Mail** under General Service Configuration
            - If E**\-Mail** is already enabled, click **Advanced**
            - Verify that "_User may login to IMAP/POP3 server_" is also checked
3. Your DNS configuration points to an old provider
    - Solution: try accessing e-mail by the [server name](https://kb.apnscp.com/platform/what-is-my-server-name/). If you can login successfully, then DNS has yet to [fully propagate](https://kb.apnscp.com/dns/how-long-does-dns-propagation-take/) yet. If you changed [nameservers](https://kb.apnscp.com/dns/nameserver-settings/) over 72 hours ago, verify the change went through by confirming with the company that manages your _domain registration_.
