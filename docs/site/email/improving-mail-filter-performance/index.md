---
title: "Improving mail filter performance"
date: "2014-11-17"
---

## Overview

E-mail that flows into the server goes through several phases of filtering before final delivery, including:

- [DNSBL lookups](http://www.dnsbl.info/) on handshake
- [Deep protocol](http://www.postfix.org/POSTSCREEN_README.html) inspection
- [DomainKeys](http://en.wikipedia.org/wiki/DomainKeys)/[SPF](http://www.openspf.org) validation
- [SpamAssassin](http://spamassassin.apache.org) filtering
    - Whitelist management
    - Hash-sharing systems ([DCC](http://www.rhyolite.com/dcc/) & [Razor](http://razor.sourceforge.net/))
    - Token-based regex matching
    - Markup filtering
    - **[Bayesian](http://en.wikipedia.org/wiki/Bayes'_theorem) filtering**

All steps in the filtering process are automated, except for **Bayesian filtering** that works by both automatic learning and manual learning. This covers how to train your filter to improve filter performance.

## How it works

Bayesian filtering breaks an e-mail down into individual words, then compares the probability of words in legitimate e-mail and spam. If certain words or phrases such as "Dr. Oz", "Solar Panels", and "Viagra" appear more frequently in e-mail identified as spam, then that e-mail that contains such phrases is likely to be spam as well. Likewise phrases that contain, "Monday", "Synergism", and "Ocelot" may be less likely to contain spam based on training data. E-mails that come in with those words are rated more favorably as non-spam and, therefore, less likely to be delivered to your [Spam folder](https://kb.apnscp.com/e-mail/accessing-spam-folder/).

## How to use it

 

### Training by IMAP folder

For e-mail accounts setup as [IMAP](https://kb.apnscp.com/e-mail/pop3-vs-imap-e-mail-protocols/), there is an easier process to feed data to the filter. Create an IMAP folder called "AutoSpam" (capitalization matters). Drag and drop e-mail that slips through to this folder for automatic analysis. E-mail is analyzed nightly. Once trained, these messages are discarded from your inbox.

### Creating AutoSpam within the control panel

An AutoSpam folder may be easily created within the control panel under **Mail** > **SpamAssassin Config**. Click **Enable Folder** under Feedback Participation. You will need to logout of your existing IMAP program to activate changes.

\[caption id="attachment\_999" align="aligncenter" width="478"\][![Drag and drop learning with the AutoSpam folder](https://kb.apnscp.com/wp-content/uploads/2014/11/autospam-learning-folder.gif)](https://kb.apnscp.com/wp-content/uploads/2014/11/autospam-learning-folder.gif) Drag and drop learning with the AutoSpam folder\[/caption\]

### Fine print

Also there are a few guidelines to bear in mind when using this service:

- Don't feed the spam filter e-mails that you have received as part of a mailing list that you signed-up for
    - _Always use the unsubscribe feature_
- Poisoning the filter (feeding non-spam to it) is bad. Don't do it.
- Results are never instantaneous and take up to 24 hours to incorporate into the algorithm.
