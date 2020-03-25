---
title: "Determining platform version"
date: "2014-10-30"
---

Hosting platform may be located within the control panel under **Account** > **Summary** > **Development** > **Platform Version**. Different hosting platforms use, relatively, slightly different architecture and hardware.

## Release Announcements

Certain platforms come with release announcements providing an overview of features. Platforms prior to 4, introduced with the data center migration from Texas to Atlanta in 2007, were unremarkable and consequently, not journaled. Version 4 was the first platform release to feature apnscp as its control panel. Fractional platforms are experimental platforms designed to introduce and test new technology.

- [Version 4.0](http://updates.apisnetworks.com/2007/01/v4-platform-release/) (Image) - _launched 2007/01_ _\- EOL_
- [Version 4.5](http://updates.apisnetworks.com/2010/08/introducing-apollo-our-next-generation-platform/) (Apollo) - _launched 2010/08 - EOL_
- [Version 5.0](http://updates.apisnetworks.com/2012/02/building-your-next-hosting-platform/) (Helios) - _launched 2012/05 - Apache 2.4, MySQL 5.5_
- [Version 6.0](http://updates.apisnetworks.com/2014/09/sol-hosting-platform/) (Sol) - _launched 2014/09 - CentOS 7, any-version Python/Ruby, virtualized platform, MariaDB switch, Postgres 9.3_
- [Version 6.5](http://updates.apisnetworks.com/2016/01/luna-launched-open-beta/) (Luna) _\- launched 2016/02 - PHP 7.0, any-version Node, http/2 introduced, MariaDB 10.1, OverlayFS, Postgres 9.4_
- [Version 7.0](http://updates.apisnetworks.com/2017/01/atlas-launches/) (Atlas) - _launched 2017/01 - PHP 7.1, MariaDB 10.2, Postgres 9.6_
- Version 7.5 (Delta) - _[coming Q2 2018](https://forums.apnscp.com/t/planning-v7-5-platform/27) - rspamd, PHP 7.2, MariaDB 10.3, stricter SELinux enforcement, full automation, any-version Go, Postgres 10.0, ProxySQL_

## Platform Migration

If you're on an older platform, simply open a ticket within the control panel to request a [platform migration](https://kb.apnscp.com/platform/migrating-another-server/). Migrations are automated, take 24 hours to complete and have zero-impact on your day-to-day operations, so long as you continue to use our [nameservers](https://kb.apnscp.com/dns/nameserver-settings/).

## EOL Platforms

Platforms are periodically marked as first end-of-life, then physically removed from production 2-4 years after EOL. EOL platforms are no longer maintained due to technological obsolescence. If you are on an EOL server, open up a ticket to request a migration to a newer platform otherwise we will migrate your account for you right before the server is physically switched off.
