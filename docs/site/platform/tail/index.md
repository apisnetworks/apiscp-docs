---
title: "tail emits warning: unrecognized file system type"
date: "2016-01-30"
---

## Symptom

tail when used on [v6.5+](https://kb.apnscp.com/platform/determining-platform-version/) platforms will successfully open a file, but elicit a warning similar to:

tail: unrecognized file system type 0x794c7630 for ‘error\_log’. please report this to bug-coreutils@gnu.org. reverting to polling

## Cause

Older versions of tail, such as shipped with RHEL7.2, do not ship with a version of coreutils that properly detects the magic number for OverlayFS.

## Solution

Ignore it. This is pending on an upstream vendor patch in coreutils, which [patched already](http://git.savannah.gnu.org/gitweb/?p=coreutils.git;a=commitdiff;h=v8.24-111-g1118f32).
