---
title: "Understanding message failures"
date: "2015-03-20"
---

## Overview

Sometimes an e-mail sent from the server to a recipient will fail. There are a variety of causes and as a "best practice", the receiving side will report the failure reason for easy understanding. However, it is prudent to note that a reason is not mandatory (just good practice) and there is no consistent language through which these rejection reasons are conveyed.

A typical rejection e-mail consists of 3 parts:

1. A modified Subject, typically including **Undelivered** or **Failure** in the title
    - e.g. "Undelivered Mail Returned to Sender" or "Delivery Status Notification (Failure)"
    - these language is entirely dependent upon the reporting side and could be in any language
2. A sender different than the recipient
    - Common automated senders include names such as "Mail Delivery System", "Mailer-Daemon", and "postmaster"
3. A reason embedded with the automated response, usually within the first few paragraphs. Like the first 2 components, there is no set format for how these reasons are formatted. Below are a few samples with reasons in bold for emphasis:
    - Sample 1:
        
        This is the mail system at host sputnik.apnscp.com.
        
        I'm sorry to have to inform you that your message could not
        be delivered to one or more recipients. It's attached below.
        
        For further assistance, please send mail to postmaster.
        
        If you do so, please include this problem report. You can
        delete your own text from the attached returned message.
        
                           The mail system
        
        <shawn@host.ca>: host host.ca\[100.200.3.4\] said: **452 4.3.1 Insufficient system storage (in reply to MAIL FROM command)** 
        
    - Sample 2:
        
        Delivery has failed to these recipients or groups:
        Joe Blow (user@coca-cola.com)
        
        **Delivery not authorized, message refused**
        
        Your message wasn't delivered due to an email rule restriction created by the recipient's organization email administrator. Please contact the recipient or the recipient's email administrator to remove the restriction.
        
        For more information about this error see DSN code 5.7.1 in Exchange Online - Office 365.
        
    - Sample 3:
        
        Reporting-MTA: dns; apollo.apnscp.com
        X-Postfix-Queue-ID: 27CCC184D7D3
        X-Postfix-Sender: rfc822; myaddress@mydomain.com
        Arrival-Date: Wed, 18 Feb 2015 13:00:41 -0500 (EST)
        Final-Recipient: rfc822; user@example.com
        Original-Recipient: rfc822;user@example.com
        Action: failed
        Status: 5.4.4
        Diagnostic-Code: X-Postfix; **Host or domain name not found. Name service error** **for name=example.com type=A: Host not found**
        

## Rejection samples

This is not an exhaustive list, but instead a list of common rejection notices that clients ask about.

### Invalid user

**Explanation:** an invalid user is a user on the receiving side that no longer exists. This may be because of a typo in the e-mail address or the user has switched e-mail providers. Regardless, this address no longer exists (it's like sending a letter to a defunct mailing address).

1. Sample:
    
    <test2@example.com>: host mail.example.com\[64.22.68.20\] said: 550 5.1.1
        <test2@example.com>: Recipient address rejected: **User unknown in virtual mailbox table** (in reply to RCPT TO command)
    
2. Sample:
    
    Subject: Some subject about cats
    Sent:    3/9/2015 11:09 AM
    The following recipient(s) cannot be reached:
       someuser@anotherdomain.com
       **The recipient has been deleted or has no e-mail address.**
    
3. Sample:
    
    <user@some.edu>: host mail.some.edu\[100.200.150.250\] said: 550 5.1.1
        <user@some.edu>... **User unknown** (in reply to RCPT TO command)
    
4. Sample:
    
    <someuser@gmail.com>: host aspmx.l.google.com\[64.233.160.26\] said: 550 5.2.1
        **The email account that you tried to reach is disabled**. wh8si1537215oeb.11 -
        gsmtp (in reply to RCPT TO command)
    

### Mailbox full

**Explanation:** the recipient's mailbox is at its storage capacity and cannot receive any further e-mail until the recipient takes action to clean-up its mailbox.

1. Sample:
    
    <shawn@oh.ca>: host oh.ca\[7.2.5.37\] said: 452 4.3.1 **Insufficient
        system storage** (in reply to MAIL FROM command)
    

### Misconfigured DNS

**Explanation:** DNS is what maps a domain name to an IP address and it is the IP address that a mail server connects to deliver a message. If DNS is improperly configured on the receiving side, then the server can't deduce where to deliver the e-mail. As a concrete example: imagine delivering a letter to an individual's house with an address; that's DNS. Imagine delivering the message to the individual's house, but you don't know the address or don't have the address available; the courier cannot deliver a message if he does not know the address to deliver. That's what happens with a misconfigured DNS.

1. Sample:
    
    <user@example.com>: **Host or domain name not found.** Name service error for name=example.com type=MX: Host not found, try again
    
2. Sample:
    
    Diagnostic-Code: X-Postfix; **Host or domain name not found**. Name service error for name=example.com type=A: Host not found
    
3. Sample (cannot connect to mail server at destination):
    
    <guy@somedomain.com>: connect to
        somedomain.com\[2.43.58.25\]:25: **Connection refused**
    

### Misconfigured greylisting

**Explanation:** the recipient's mail server is using a [greylisting](http://en.wikipedia.org/wiki/Greylisting) technique to reduce spam by _temporarily_ rejecting e-mail. E-mail will automatically be retried within a hour, but if greylisting is improperly configured on the recipient's side, e-mail may exponentially delay up to 8 hours per retry. If greylisted entries are reset every 4-6 hours, then some e-mail may remain undeliverable.

1. Sample:
    
    <user@example.com>: host mail13.mailrelay.com\[216.119.106.129\] said: **451 Greylisted, please try again in 300 seconds** (in reply to RCPT TO command)
    

### Relaying denied

**Explanation:** when mail passes through a server, one of three things must happen: (1) the client sending mail must be [authenticated](https://kb.apnscp.com/e-mail/unable-send-e-mail/) with the server usually by sending a [login/password](https://kb.apnscp.com/e-mail/accessing-e-mail/), (2) the receiving server must be configured to know its the final destination for the recipient, _or_ (3) the receiving server must be configured to pass the message off to another server en route to its final destination. If any of these conditions are not met, it is construed as an unapproved "relay", which is _case #3_ without proper configuration.

1. Sample (case #2, recipient end is improperly configured as reported by _Remote-MTA_):
    
    Reporting-MTA: dns; augend.apnscp.com 
    X-Postfix-Queue-ID: CA05A216020E 
    X-Postfix-Sender: rfc822; Arrival-Date: Fri, 2 Jan 2015 07:15:58 -0500 (EST) 
    Final-Recipient: rfc822; information@somedomain.com
    Original-Recipient: rfc822;information@somedomain.com
    Action: failed Status: 5.7.1 
    **Remote-MTA: dns; mx1.emailsrvr.com** 
    Diagnostic-Code: smtp; 550 5.7.1 <information@somedomain.com>: **Relay access denied.**
    
2. Sample (case #1, destination e-mail elsewhere, resolve by [authenticating](https://kb.apnscp.com/e-mail/unable-send-e-mail/) with the mail server):
    
    The message could not be sent because one of the recipients was rejected by the server. 
    
    The rejected e-mail address was 'user@anotherdomain.com'. Account: 'mail.mydomain.com', Server: 'mail.mydomain.com', Protocol: SMTP, Server Response: '550 5.7.1 <user@anotherdomain.com>... **Relaying denied. Proper authentication required.**', Port: 25, Secure(SSL): No, Server Error: 550, Error Number: 0x800CCC79
    
3. Sample (case #2, if domain is part of your account, resolve by [authorizing server](https://kb.apnscp.com/e-mail/authorizing-hostnames-handle-e-mail/) to handle mail for domain):
    
    Delivery to the following recipient failed permanently:
         info@mydomain.com
    Technical details of permanent failure: 
    Google tried to deliver your message, but it was rejected by the server for the recipient domain mydomain.com by mail.mydomain.com. \[64.22.68.62\].
    
    The error that the other server returned was:
    554 5.7.1 <info@mydomain.com>: **Relay access denied**
    

### DNS blacklist

**Explanation:** although uncommon, our mail servers end up on DNS blacklists for inappropriate behavior (account gets hacked, begins to disseminate spam). Open a ticket within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) under **Help** > **Trouble Tickets** and include a copy of the message for us to look into it and get the server delisted.

1. Sample:
    
    550 5.2.1 Mailbox unavailable. **Your IP address 64.22.68.10 is blacklisted** using RBL-Plus. Details: http://www.mail-abuse.com/cgi-bin/lookup?64.22.68.10. (in reply to RCPT TO command)
    
2. Sample:
    
    Diagnostic-Code: smtp; 550 OU-002 (COL0-MC6-F14) Unfortunately, messages from 64.22.68.6 weren't sent. Please contact your Internet service provider **since part of their network is on our block list**. You can also refer your provider to http://mail.live.com/mail/troubleshooting.aspx#errors.
    
3. Sample:
    
    Final-Recipient: rfc822; \[recipient email address\] Original-Recipient: rfc822; some@address.com Action: failed Status: 5.7.1 Remote-MTA: dns; mx241.emailfiltering.com Diagnostic-Code: smtp; 550 5.7.1 **Your IP 64.22.68.4 is blacklisted**. Click delist.emailfiltering.com to delist
    
4. Sample (not a blacklist, but broken heuristics on receiving side):
    
    Final-Recipient: rfc822; someuser@anotherdomain.com
    Original-Recipient: rfc822;someuser@anotherdomain.com
    Action: failed
    Status: 5.7.1
    Remote-MTA: dns; narya.dtnx.eu
    Diagnostic-Code: smtp; 554 5.7.1 Client host '64.22.68.65' rejected: **listed as**
     **suspicious, bad, or broken** --- http://dtnx.net/04/G/3M
