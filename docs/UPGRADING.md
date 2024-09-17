# Upgrading

Updates are separated into two categories, panel and system.

## Panel updates

ApisCP follows semantic versioning beginning with 3.0.0. Versions are split into 3 categories delimited by a period numerically ascending.

* Major is the leading number (3). Major versions are guaranteed to introduce significant changes that may require rework to third-party modules that use ApisCP. Major changes should be deployed with caution on any environment.
* Minor is the second number (0). Minor versions may introduce minor API changes or new services, however will not break anything in a meaningful way. Minor changes are considered safe for most environments.
* Patch is the final number (0). Patch versions introduce non-destructive additions or bugfixes and are considered safe to always apply.

ApisCP is configured to deploy patch and minor updates on update. This is controlled with `cp.update-policy` [Scope](admin/Scopes.md). Possible values include:

- **all**: always apply official updates  
    *Example: ✔️ 3.1.1 => 3.1.2, ✔️ 3.1.10 => 3.2.0, ✔️ 4.3.99 => 5.0.0, ❌ 3fcae012 => cefa3210*
- **major**: apply official updates if major version does not change  
    *Example: ✔️ 3.1.1 => 3.1.2, ✔️ 3.1.10 => 3.2.0, ❌ 4.3.99 => 5.0.0*
- **minor**: apply official updates if minor version does not change  
    *Example: ✔️ 3.1.1 => 3.1.2, 3.1.10 =>❌ 3.2.0*
- **false**: never apply updates  
    *Example: ❌ 3.1.1 => 3.1.2*
- **edge**: always apply updates, official or experimental  
    *Example: ✔️ 3.1.1 => 3.1.2, ✔️ 3.1.10 => 3.2.0, ✔️ 4.3.99 => 5.0.0, ✔️ 3fcae012 => cefa3210*
- **edge-major**: apply edge updates until next major release  
    Example: ✔️ 3.1.1 => cefa3210, ✔️ cefa3210 => 3.1.2, ❌ 3.1.2 => 4ac0f25f

Updates are checked automatically every night. This behavior can be changed via `cp.nightly-updates` Scope.

Set the update policy to "edge" to help test new features. "edge" deploys code that is published to Gitlab before a formal release tag is defined for a commit.

For example, to disable update checks, but deploy the latest code on manual update via `upcp`:

```bash
cpcmd scope:set cp.update-policy edge
cpcmd scope:set cp.nightly-updates false
```

### Switching to EDGE

An EDGE update policy ensures you are the latest [commit](https://gitlab.com/apisnetworks/apnscp/-/commits/master), which may contain untested/experimental code. You may be asked to switch to EDGE to validate a fix before the next public release. Switching may be done using a [Scope](admin/Scopes) + upcp:

```bash
cpcmd scope:set cp.update-policy edge
upcp
```

ApisCP will automatically merge new changes and restart itself. To switch back, reset the update policy ("**major**" is default), then reset the code.

```bash
cpcmd scope:set cp.update-policy major
upcp --reset
systemctl restart apiscp
```

::: tip
`upcp --reset` is useful if you make changes to the panel code while debugging a problem. `--reset` will always return the panel code to its original state.
:::

### upcp update helper

`upcp` is an alias to `build/upcp.sh` distributed as part of ApisCP. `upcp` checks for releases off Gitlab and deploys consistent with your update policy. A variety of flags can influence how upcp operates. With the exception of `--reset`, they may be mixed.

| Flag    | Purpose                                                      |
| ------- | ------------------------------------------------------------ |
| -n      | Skip migrations that automatically run after update          |
| -b      | Run [Bootstrapper](https://github.com/apisnetworks/apnscp-bootstrapper) reporting only changes |
| -s      | Skip updating code (e.g. upcp -sb, Bootstrap without updating panel) |
| -v      | Verbose mode, up to 3 levels |
| -f      | Force respective operation. Set `force=yes` in Ansible, call `upcp --reset` before updating code. |
| -l      | List available Bootstrapper roles (*see below*) |
| -a      | Run Bootstrapper if the latest release contains changes to playbook |
| -w      | Wait for Bootstrapper to finish running. Exits 1 if Bootstrapper not running. 0 if waited. |
| --var=KEY=VALUE | Pass variable `KEY` with value `VALUE` to Bootstrapper. KEY may be plain-text or JSON without specifying =VALUE. |
| --reset | Reset panel code, including all changes, to match Gitlab     |
| --flare   | Check for FLARE signal. Exit status 0 if received, 1 if none available |

`-b` accepts a list of roles to run as well. For example, a common task after making changes to apnscp-vars.yml is to process the affected roles. `upcp -sb mail/rspamd mail/configure-postfix`  runs only the rspamd + configure-postfix subroles within mail.

Additional arguments may be provided through the `BSARGS` environment variable,

```bash
env BSARGS="--extra-vars=force=yes" upcp -sb apnscp/install-extensions
```

### Update window

ApisCP updates are delivered `@daily` according to systemd. This time is approximately midnight (00:00:00) with a randomized delay up to 10 minutes to stagger concurrent tasks. Updates may be shifted to occur at different times or even different days following systemd's [calendar definition](https://www.freedesktop.org/software/systemd/man/systemd.time.html#Calendar%20Events).

```bash
# Enable updates every night at 00:00:00
cpcmd scope:set cp.nightly-updates true
# Disable updates
cpcmd scope:set cp.nightly-updates false
# Run updates M-F at 11 PM. Skip weekends
cpcmd scope:set cp.nightly-updates 'Mon..Fri 23:00'
# Run updates first of every month at 02:00
cpcmd scope:set cp.nightly-updates '*-*-01 02:00'
```

::: tip Emergency FLARE updates
FLARE updates will always supersede preferred update times. Such updates are broadcasted sparingly to address either a zero day or critical hotfix.
:::

### Staggered updates
**New in 3.2.46**

An offset may be set, in hours, to abstain from updates if another commit has occured within that window. This allows releases to "cure" as well as staggered deployment across servers. Servers in `edge-major`, a transitive update policy, will ignore stagger values.

```bash
# Require 48 hours without a release to deploy
cpcmd scope:set cp.update-offset 48
# Disable staggered deployment
cpcmd scope:set cp.update-offset 0
```

::: tip
This works in EDGE as well. In the above example, an update would remain postponed until master goes multiple days without an update.
:::

### FLARE updates

FLARE is a separate update system for ApisCP that performs hourly checks for critical releases. FLARE is automatically enabled whenever nightly updates are enabled (`cpcmd scope:get cp.nightly-updates`). This feature is a crucial side-channel to allow emergency updates should the need arise (new OS update introduces volatile changes, zero day mitigation, etc). FLARE checks are handled via `apnscp-flare-check` timer and its eponymous oneshot service.

```bash
systemctl list-timers apnscp-flare-check.timer
# Outputs:
# Sun 2020-02-23 14:36:50 EST  22min left Sun 2020-02-23 14:00:18 EST  14min ago apnscp-flare-check.timer apnscp-flare-check.service
# 1 timers listed.
```

### Update failure notifications
**New in 3.2.14**

ApisCP will generate a failure email if `upcp` fails abnormally during non-interactive mode. Update logs are stored in `storage/.upcp.failure` and removed when `upcp` exits with a zero status. ApisCP on each boot looks for this file, sending log contents to the admin email (`cpcmd common:get-email`) if present. `misc:notify-update-failure()` is the corresponding API command.

These notification checks may be disabled permanently by setting `LOG_UPDATE=false` in `/etc/sysconfig/apnscp`.

## System updates

System updates are delivered via Yum. It is recommended to NOT alter this default. Failing appropriate judgment, this may be changed via `system.update-policy` Scope,

```bash
cpcmd scope:set system.update-policy security-severity
```

If system updates are disabled, then they may be applied from the command-line via `yum update`. The default setting, `default`, always applies system updates when available and applies any filesystem replication as needed.

### Manual FST updates

Filesystem template ("FST") updates are managed by Yum Synchronizer, which is invoked as a yum postaction on update/install. Yum Synchronizer usage is covered in depth in [Filesystem.md](admin/Filesystem.md).

## Problems
### `upcp` reports "fatal: refusing to merge unrelated histories"
`upcp` will fail with the above error when the current commit does not match its local history log. Two solutions exist to resolve this.

First, unshallow the repository by fetching the entire commit history.

```bash
cd /usr/local/apnscp
git fetch --unshallow
# Try updating again
upcp
```

Second, if fetching all history does not allow ApisCP to continue on its update track, perform a reset on the HEAD pointer.

```bash
cd /usr/local/apnscp
upcp --reset
git checkout master
```
