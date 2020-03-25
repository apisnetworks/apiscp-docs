---
title: "Switching users"
date: "2015-04-09"
---

## Overview

Newer platforms, [v6+ platforms](https://kb.apnscp.com/platform/determining-platform-version/) specifically, permit switching users from the account user from the [terminal](https://kb.apnscp.com/terminal/accessing-terminal/). Once switched to the user, you assume the permission rights as this user, including the ability to remove files.

## Usage

Use [su](http://apnscp.com/linux-man/man1/su.1.html) to switch users from the main user. You will not be required to enter the account password on v6+ platforms. You can also use `sudo rm` to remove files; be careful: any file can be removed! Before switching users, you will be prompted to enter your account password.

### Examples

To switch users (from admin user to "matt"):

su matt

To remove all files under `/home/matt` (as admin user):

sudo rm -rf /home/matt
