## Process limits

Limits are a per-process resource enforcement mechanism. This system provides a rudimentary backstop against runaway processes. [cgroup](Resource%20enforcement.md) is intended for site-wide resource limits.

Process limits are applied using a PAM wrapper on PAM-aware applications, which include any login service (FTP, mail, SSH, crond).

## Format

Limits may be overridden in Bootstrapper or by including a lexicographically higher file than [`10-apnscp-system.conf`](https://gitlab.com/apisnetworks/apnscp/-/blob/master/resources/playbooks/roles/system/limits/templates/apnscp.conf.j2) in `FST/siteinfo/etc/security/limits.d` (see [Filesystem.md](Filesystem.md#filesystem-template)). Files published within this location are inherited by all sites.

Settings take the following form:

```
#DOMAIN   TYPE RESOURCE VALUE
# Disable coredumps for everyone
*         -    core     0
# Enable coredumps for users under "site12"
@foobar  soft core     unlimited
# Restrict number of files opened by PHP-FPM
nobody    soft nfiles   2048
# Limit any account with a user "phil" from running more than 25 processes
phil      hard nproc    25
```

::: tip Domain resolution
User resolution is completed inside the virtual environment. In the above example "phil" applies to *any account* with a user named "phil". Often it is inappropriate to publish limits within the FST except as stopgap limits for runaway resource consumption for all users (`*`) or the unprivileged [PHP-FPM](./PHP-FPM.md) user, `apache`.
:::

A **domain** may be of the form:

- username, resolved within the [vfs](Filesystem.md).
- group name using `@group` syntax
- wildcard `*` for default entry
- wildcard `%`, can be also used with `%group` syntax, for `maxlogin` limit

## Resources

The following table summarizes available resource limits.

| Name         | Default   | Units     | Remarks                                         |
| ------------ | --------- | --------- | ----------------------------------------------- |
| core         | 0         | KB†       | Limits core file size. `0` disables core files. |
| data         | unlimited | KB†       | Maximum data segment size.                      |
| fsize        | 4194304   | KB†       | Maximum filesize.                               |
| memlock      | 64        | KB        | Maximum locked-in-memory address space.         |
| nofile       | 4096      | [0,2^20]† | Maximum number of open file descriptors.        |
| rss          | unlimited | KB†       | Ignored.                                        |
| stack        | 8192      | KB        | Maximum stack size.                             |
| cpu          | unlimited | minutes   | Maximum CPU time.                               |
| nproc        | 2048      | [0,2^63)  | Max number of processes.                        |
| as           | unlimited | KB†       | Address space limit (vmem).                     |
| maxlogins    | unlimited | —         | Max number of logins for this user.             |
| maxsyslogins | unlimited | —         | Max number of global logins for system.         |
| priority     | 20        | [0,2^63)  | Real-time process priority.                     |
| locks        | unlimited | [0,2^63)† | Max number of locks.                            |
| sigpending   | 15003     | [0,2^63)  | Max number of pending signals.                  |
| msgqueue     | 819200    | B         | Max memory used by POSIX message queues.        |
| nice         | 20        | [-20, 19] | Max nice priority allowed to raise.             |
| rtprio       | 0         | [0,2^63)  | Max real-time priority.                         |

***†** values specified accept `unlimited` as a value.*

## Scope usage

**New in 3.2.41**

`system.process-limits` sets defaults for all users within the [vfs](Filesystem.md). Items must be formatted as "\<NAME>.\<TYPE>" where \<TYPE> is "hard" or "soft". If type is omitted, then both soft and hard limits are set. Soft limits may be raised by a user up to the hard limit.

```bash
# Limit process creation to 2048 tasks, allow users to raise to 4096
cpcmd scope:set system.process-limits '[nproc.soft: 2048, nproc.hard: 4096]'
# Disable core dumps
cpcmd scope:set system.process-limits '[core: 0]'
# Set default nice to 19, allow users to increase to 5 using alternative syntax
cpcmd scope:set system.process-limits '[nice:[soft:19, hard:5]]'
# Clear override value, fallback to default
cpcmd scope:set system.process-limits '[nice: null]'
```

**See also**

- [limits.conf(5) - Linux man page](https://linux.die.net/man/5/limits.conf) (linux.die.net)

## Hard and soft

Type may either be "hard" or "soft". A hard limit is the maximal value allowed for a resource. Only root may change this. Soft values may be changed by a user up to the hard limit. 

Consider the following in `site1/fst/etc/security/limits.d/nice-limit.conf`:

```
* soft nice 0
* hard nice -5
```

```bash
su site1
whoami
# Reports admin
renice 0 $$
# 30307 (process ID) old priority 19, new priority 0
renice -1 $$
# renice: failed to set priority for 30307 (process ID): permission denied
```

::: tip Explanation
A user is able to increase process priority from 19 down to 0 but may not specify a negative process priority, which preempts other processes on the system. A priority of 0 gives equal weighting to all system processes while a value greater than 0 would deprioritize.
:::
