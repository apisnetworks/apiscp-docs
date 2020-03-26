# FTP

## Troubleshooting

### On chdir: Remote host has closed the connection

#### Background

vsftpd uses [seccomp sandboxing](https://lwn.net/Articles/656307/) to improve security by reducing potential vectors in the kernel. Removing a user from the system can result in getpwnam() to fail in translating uid to username resulting in a crash.

#### Solution

seccomp filtering is disabled in vsftpd by adding `seccomp_sandbox=NO` to `/etc/vsftpd/vsftpd.conf`.

