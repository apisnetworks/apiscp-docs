# What is apnscp?

apnscp is a control panel + platform produced by Apis Networks since 2003 that provides high performance, integrated security, and multi-tenant isolation. 

# What are some features of apnscp?

* apnscp is built on PHP7, which means it's fast, very fast. Further, apnscp integrates a few Laravel fixins, including [Blade templates](https://laravel.com/docs/5.4/blade) and several [helpers](https://laravel.com/docs/5.2/helpers) that users familiar with Laravel or even PHP, will value in its ease of extendibility.


* apnscp bundles its isolation and resource enforcement component, as that is part of its platform, into the license. 
* apnscp provides any-version Node, Python, and Ruby that are isolated to an account. This allows multiple users to run multiple versions without interfering with others.

# Is apnscp stable?

apnscp has been continuously in development and actively in use with our clients, encompassing beyond 15,000, since 2003. Our hosting subsidiary serves as a test bed for early features with consistent monitoring to ensure releases, once tagged and bundled for release, are stable too. 

Having an active hosting business also affords a 360° view of active threats and emerging patterns that can in turn be incorporated into the panel. For example, [mod_evasive](https://github.com/apisnetworks/mod_evasive) and its subsequent patches were integrated into the platform as a response to curtail brute-force attempts witnessed on production servers.

apnscp is designed first to run on our production servers. It is covered by unit tests and unit tests cover predictable inputs.

# How can I add apps/modules?

See {{ Programming Guide }}

# How can I help?

Several parts of apnscp are built on permissive licenses. [Modules](https://github.com/apisnetworks/apnscp-modules) are bundled under the Artistic License, [Process](https://github.com/apisnetworks/util-process), [Error Reporter](https://github.com/apisnetworks/error-reporter), and [CSS](https://github.com/apisnetworks/apnscp-bootstrap-sdk) are MIT-based. Fork, change, and submit a pull request through GitHub. If you want to request an improvement or find an issue in the core library, open an issue in the [tracker](https://github.com/apisnetworks/apnscp/issues).

# How can I get help?

There are two ways to get support. You can use free [community support](https://forums.apnscp.com) through the community forums. We also provide expedited [commercial support](https://apnscp.com/support) with up to a 15-minute turnaround time.