---
title: "Is a secure form of FTP provided?"
date: "2016-02-20"
---

Yes, all packages support FTP using explicit TLS, also called "Auth TLS". Auth TLS initiates encryption after a handshake and protocol announcement, which is the origin of "explicit". Conversely, implicit TLS, which is not supported, does not require announcement and encryption happens immediately at connection. The difference between implicit and explicit TLS is protocol formality only.

SCP and SFTP, which rely on SSH for transport, and are only available on packages that include [terminal](https://kb.apnscp.com/terminal/is-terminal-access-available/) access.

## See also

- KB: [Accessing FTP server](https://kb.apnscp.com/ftp/accessing-ftp-server/)
