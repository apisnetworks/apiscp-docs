# Architecture

ApisCP uses a variety of services managed directly by ApisCP with minimal configuration. The diagram and table summarize components and relevant documentation for each segment.

![ApisCP platform diagram](./images/platform-diagram.svg)

| Service Group                | Service       | Role                                                         |
| ---------------------------- | ------------- | ------------------------------------------------------------ |
| **ApisCP**                   |               |                                                              |
|                              | Apache        | UI                                                           |
|                              | apnscpd       | [Privileged communication](./admin/CLI.md)                   |
|                              | Horizon       | [Job runner](PROGRAMMING.md#jobs)                            |
|                              | Proxy         | [Frontend panel proxy](./admin/Panel%20proxy.md) (*optional*) |
|                              | Redis         | Temporary storage                                            |
| **BoxFS** (filesystem)       |               |                                                              |
|                              | OverlayFS     | [Account segregation](./admin/Filesystem.md) and copy-up             |
| **Mail**                     |               |                                                              |
|                              | haproxy       | SSL/TLS termination                                          |
|                              | Dovecot       | [IMAP/POP3](./admin/Dovecot.md)                              |
|                              | Postfix       | [SMTP](./admin/Smtp.md)                                      |
|                              | PostSRSd      | [Sender-rewriting scheme](./admin/Smtp.md#srs)               |
|                              | Pigeonhole    | IMAP sieve language                                          |
|                              | rspamd        | [Spam filter, policy milter, DKIM](./admin/rspamd.md) (*optional*) |
|                              | SpamAssassin  | [Spam filter](./admin/SpamAssassin.md) (*optional*)          |
|                              | Redis         | Temporary storage for rspamd                                 |
|                              | Maildrop      | [Local delivery agent](./admin/LDA.md)                       |
|                              | Authlib       | [LDA delivery translation](./admin/LDA.md)                   |
|                              | Majordomo     | [Mailing lists](admin/Majordomo.md)                          |
| **Apache** (HTTP)            |               |                                                              |
|                              | Apache        | [HTTP server](./admin/Apache.md), high-performance configuration |
|                              | PHP-FPM       | [PHP service workers](./admin/PHP-FPM.md)                    |
|                              | Passenger     | [Polyglottal language launcher](./admin/webapps/Passenger.md) |
|                              | Pagespeed     | [HTML rendering optimizer](./admin/Benchmarking.md#optimizing-render) |
|                              | mod_cache     | [Output cache](./admin/Benchmarking.md#output-cache)         |
| **Web application firewall** |               |                                                              |
|                              | Evasive       | [Brute-force protection](./admin/Evasive.md)                 |
|                              | Fortification | [Privilege separation framework](./admin/Fortification.md)   |
|                              | ModSec        | [Malware protection](./admin/ModSecurity.md)                 |
|                              | ClamAV        | Malware scanner                                              |
| **Firewall**                 |               |                                                              |
|                              | Rampart       | [Threat deterrent, firewall](./FIREWALL.md)            |
| **Resource enforcement**     |               |                                                              |
|                              | cgroups       | [Per-account resource limitations](./admin/Resource%20enforcement.md) |
| **Statistics**               |               |                                                              |
|                              | TimescaleDB   | [Long-term server + account statistics](./admin/Metrics.md)  |
| **Argos** (monitoring)       |               |                                                              |
|                              | Monit         | [Service monitoring](./admin/Monitoring.md)                  |
|                              | ntfy          | Defect alerts                                                |
| **Services**                 |               |                                                              |
|                              | MySQL         | [Panel frontend data](./admin/MySQL.md), web apps            |
|                              | OpenSSH       | SSH server                                                   |
|                              | PostgreSQL    | [Account metadata, mail routing, statistics storage](./admin/PostgreSQL.md) |
|                              | rsyslog    | Logging |
|                              | vsftpd        | [FTP server](./admin/FTP.md)                                 |

