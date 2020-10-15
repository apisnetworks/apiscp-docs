# Kernel

CentOS 7 ships with 3.10 kernel family while CentOS 8 is based on 4.18. These are stock kernels vetted and delivered by Red Hat. In addition to the OS kernel, ApisCP ships with package-based kernels from [ELRepo](http://elrepo.org/tiki/HomePage). Long-term (`-lt` suffix) and mainline (`-ml` suffix) are offered.

## Changing kernels

Long-term kernels provide greater stability, but are only available on CentOS 7 as an alternative to 3.10; this is recommended for improved OverlayFS support used by [BoxFS](Filesystem.md).

Mainline kernels are available on both CentOS 7 and CentOS 8 of the 5.x family. These offer newer features at the expense of potential kernel panics. Kernels are configured using the `system.kernel` [Scope](Scopes.md). ApisCP may be configured to reboot automatically whenever a new kernel is installed with `kernel_automated_reboot`.

```bash
# Switch to long-term kernel from ELRepo
cpcmd scope:set system.kernel stable
# Revert back to OS kernel
cpcmd scope:set system.kernel system
# Reboot whenever a kernel upgrade occurs
cpcmd scope:set cp.bootstrapper kernel_automated_reboot true
# Switch to mainline kernel from ELRepo
cpcmd scope:set system.kernel experimental
# A kernel reboot will now occur when the kernel is upgraded from 4.x to 5.x...
```

## Troubleshooting

### Bugged kernel warning

3.10 kernels in CentOS 7 include a preview version of OverlayFS that requires additional workarounds for dangling file descriptors that won't release until the driver is fully removed from the OS, which requires a reboot.

```bash
WARNING : ListenerServiceCommon::start(): You are running a bugged version of the Linux kernel. Workarounds in place. Upgrade to a kernel newer than 3.10.1
```

While such workarounds are in place, if a process such as PM2 retains an open file handle on /proc, then moving to the 4.x kernel branch is necessary *or terminating the offending process before a new site is added*. 4.x kernel may be installed on CentOS 7 with `scope:set system.kernel stable`. Additionally, CentOS 8+ uses a newer kernel with a more stable version of OverlayFS that does require the same workarounds.