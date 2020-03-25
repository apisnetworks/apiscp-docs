---
title: "Welcome aboard: your next steps!"
date: "2014-12-02"
---

## Introduction

First off, thank you personally for deciding to host with Apis Networks. Now that you have a spot to host your domain, there are some steps to take to attach your domain to your hosting. It's painless, and takes between 10 and 15 minutes, depending if you are a slow reader like the author. Regardless, bear with this primer. It's well worth it!

## Domain Migration

First, there is an important distinction analogized best with vehicles: hosting is your vehicle that gets your name and existence places. Your domain name is like the vehicle tag that must be renewed annually. Without a valid vehicular registration, you can't drive anywhere! This following section covers domain registrations (tag transfers):

### New Domain Registration

Purchased a new domain when registering hosting with Apis Networks? Everything is primed and ready to go! _Skip onto the next big section: **Getting Started**._

### Moving Domain from a Previous Company

At the very least, your domain nameservers must be changed to **ns1.apnscp.com** and **ns2.apnscp.com**. This is done through the company through which your domain name is registered; in other words, it's to whomever payment is remitted to renew the existence of your domain. Some hosts bundle this domain into your hosting, but don't provide separation between hosting and registration, so to divorce yourself from it you will need to _change registrars_. If you can change the nameservers, no need to **Change Registrars:** _skip over the next section to **Getting Started**_!

#### Changing Registrars

Registrar transfers will separate you from your current registrar to a neutral third-party. This is recommended historically, because some registrars prefer to hold domain names hostage over bogus balances. _**Always transfer your domain before terminating a hosting contract.**_ We adopt best practices by utilizing a neutral, third-party registrar via [domains.apnscp.com](http://domains.apnscp.com). Transfers are free. Renewals are $10/year. Transfers include a renewal at $10/year.

> _Domain registration is a high volume, low margin industry_. If you prefer registrar XYZ, because domain ABC is registered there, then use it. You want to keep all your domains under one roof preferably, because a change of (e-mail) address is easier to update. Use [Namecheap](http://www.namecheap.com), [gandi.net](http://gandi.net), [Hover](http://www.hover.com), [GoDaddy](http://www.godaddy.com), or whoever works best for you. Just keep your domains under one roof for simplicity.

Registrar transfers take 3-10 business days to complete. Once your registrar has been transferred, then change your nameservers to **ns1.apnscp.com** and **ns2.apnscp.com**. DNS changes will be active within 24 hours.

## Getting Started

### Setting Up E-mail

Do you want to forward your e-mail to a remote account (less reliable) or have it delivered locally? If you want to forward it remotely, caveat emptor. See  KB: "[Creating a forwarded email](https://kb.apnscp.com/e-mail/creating-a-forwarded-e-mail/)". If you would like for mail to arrive on your hosting account, awesome: that's a sensible solution. You can either create a new mailbox via **User** > **Add User** within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) or to attach an e-mail address to an existing user, visit **Mail** > **Manage Mailboxes**. Enter the new e-mail address, and select your username. Mail access is covered in a separate KB article: "[Accessing e-mail](https://kb.apnscp.com/e-mail/accessing-e-mail/)"

### Getting Your Site(s) Online

_Almost done_! Now you need to create a web site in this location. If you're migrating over, then copy your website files to the [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/) for your site, which is always `/var/www/html`. If you're starting fresh, [WordPress](http://www.wordpress.org) is always a great candidate. Just remove `index.html` from this location before uploading your new site. You can also edit this page on-the-fly under **Files** > **File Manager**.

> #### Preview Your Domain
> 
> Domains may be previewed by overriding global DNS. We have a separate guide available under KB: [Previewing your domain](https://kb.apnscp.com/dns/previewing-your-domain/). This method will work every time and allows you to preview your site before initiating nameserver changes.

## Miscellany

### Adding More Domains

More domains may be [added](https://kb.apnscp.com/control-panel/creating-addon-domain/) to your account via **DNS** > **Addon Domains**. Just follow the same rules with **Domain Migration** section to get the tag attached to the right vehicle in the _proper state_. Always locate addon domains under `/var/www` instead of `/var/www/html`. There are pedantic [fringe cases](https://kb.apnscp.com/web-content/where-is-site-content-served-from/#careful) covered elsewhere for the intrepid user.

### Understanding Permissions

Apis Networks uses a separate, non-privileged user for its web server. This improves security by only letting the web server read what _you_ authorize it to read/access, but requires a few extra steps to setup PHP applications like [WordPress](https://kb.apnscp.com/wordpress-2/enabling-write-access/) and Drupal. KB: [Permissions overview](https://kb.apnscp.com/guides/permissions-overview/) is a crash-course in permissions. Know what you're doing? Great. Just change relevant directories that require write access to _717_.

### Building Your Own Software

Congratulations, you've moved up in comfort! Clients may build any software and run any service that is necessary to operation of the web site – _please don't run a game server or bitcoin miner_. Any applications should be plug-and-play. C applications will [require installation](https://kb.apnscp.com/terminal/compiling-programs/) under `/usr/local`. Gems, packages, modules, eggs, etc. (_kudos to those who affiliated terms with language_) will be installed just fine with their respective install command. `gem install`,  `pear install`,  `perl -MCPAN -e 'install'`, `pip-python install` require no further configuration.

### Running Services

Need to run a daemon? No problem. Clients can run up to 10 services from the [terminal](https://kb.apnscp.com/terminal/accessing-terminal/) that listen externally on a TCP socket. See KB: [Listening on ports](https://kb.apnscp.com/terminal/listening-ports/).

Looking for specific, advanced guides? Check these out:

- [WordPress](https://kb.apnscp.com/wordpress/installing-wordpress/)
- [Redis](https://kb.apnscp.com/guides/running-redis/)
- [Node.js](https://kb.apnscp.com/guides/running-node-js/)
- [Django](https://kb.apnscp.com/python/django-quickstart/)
- [Rails](https://kb.apnscp.com/ruby/setting-rails-passenger/)
- [MongoDB](https://kb.apnscp.com/guides/running-mongodb/)

Thanks again for joining, and have fun!
