# Conventions

Multiple components of ApisCP are referenced with different markup.

* *[section]* => *option*: config.ini settings
* *Class\Subclass*: typically in changelogs, provides visibility of at least two levels corresponding to class
* *group*.*name*: configuration [scopes](docs/Scopes.md)
* *service*,*value*: service configuration (e.g. siteinfo,email)
* *role*/*subrole*: [Bootstrapper](https://github.com/apisnetworks/apnscp-playbooks) tasks, correspond to `roles/` directory
* *module*: typically in changelogs (italicized outside), module name (`lib/modules`)
* *Word Word*: applications within ApisCP's front-end (`apps/`, see `lib/Template/` for name => directory mapping)
* *siteXX*: site identifier. See [DEBUGGING.md](DEBUGGING.md) for information on determining this value
* *siteXX/path* (also *siteXX/fst/path*): refers to account root in /home/virtual/siteXX/fst/*path*
* *siteXX/shadow/path*: similar to account root, but refers to data-only layer in /home/virtual/siteXX/shadow/*path*
* *siteXX/info/path*: account metadata location, refers to /home/virtual/siteXX/info/*path*
