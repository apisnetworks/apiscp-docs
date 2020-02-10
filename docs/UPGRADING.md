# Upgrading

Updates are separated into two categories, panel and system.

## Panel updates

apnscp follows semantic versioning beginning with 3.0.0. Versions are split into 3 categories delimited by a period numerically ascending.

* Major is the leading number (3). Major versions are guaranteed to introduce significant changes that may require rework to third-party modules that use apnscp. Major changes should be deployed with caution on any environment.
* Minor is the second number (0). Minor versions may introduce minor API changes or new services, however will not break anything in a meaningful way. Minor changes are considered safe for most environments.
* Patch is the final number (0). Patch versions introduce non-destructive additions or bugfixes and are considered safe to always apply.

apnscp is configured to deploy patch and minor updates on update. This is controlled with `apnscp_update_policy` in [apnscp-vars.yml](https://github.com/apisnetworks/apnscp-playbooks/blob/master/apnscp-vars.yml). Update policy can be configured using a [scope](docs/Scopes.md). Updates are checked automatically every night. This behavior can be changed with `apnscp_nightly_update` in apnscp-vars.yml or via `apnscp.nightly-updates` scope.

Set the update policy to "edge" to help test new features. "edge" deploys code that is published to Gitlab before a formal release tag is defined for a commit.

For example, to disable update checks, but deploy the latest code on manual update via `upcp`:

```bash
cpcmd config:set apnscp.update-policy edge
cpcmd config:set apnscp.nightly-updates false
```

### upcp update helper

`upcp` is an alias to `build/upcp.sh` distributed as part of apnscp. `upcp` checks for releases off Gitlab and deploys consistent with your update policy. A variety of flags can influence how upcp operates. With the exception of `--reset`, they may be mixed.

| Flag    | Purpose                                                      |
| ------- | ------------------------------------------------------------ |
| -n      | Skip migrations that automatically run after update          |
| -b      | Run [Bootstrapper](https://github.com/apisnetworks/apnscp-bootstrapper) reporting only changes |
| -s      | Skip updating code (e.g. upcp -sb, Bootstrap without updating panel) |
| -a      | Run Bootstrapper if the latest release contains changes to playbook |
| --reset | Reset panel code, including all changes, to match Gitlab     |
| --flare   | Check for FLARE signal. Exit status 0 if received, 1 if none available |

`-b` accepts a list of roles to run as well. For example, a common task after making changes to apnscp-vars.yml is to process the affected roles. `upcp -sb mail/rspamd mail/configure-postfix`  runs only the rspamd + configure-postfix subroles within mail.

### FLARE Updates

FLARE is a separate update system for apnscp that performs hourly checks for critical releases. FLARE is automatically enabled whenever nightly updates are enabled (`cpcmd config:get apnscp.nightly-updates`). This feature is a crucial side-channel to allow emergency updates should the need arise (new OS update introduces volatile changes, zero day mitigation, etc). FLARE checks are handled via `apnscp-flare-check` timer and its eponymous oneshot service.

## System updates

System updates are delivered via Yum. It is recommended to NOT alter this default. Failing appropriate judgment, this may be changed via `yum_update_policy` in apnscp-vars.yml or using the `system.update-policy` scope,

```bash
cpcmd config:set system.update-policy security-severity
```

If system updates are disabled, then they may be applied from the command-line via `yum update`.
