---
title: "Terminal access times out"
date: "2015-03-28"
---

## Overview

Attempting to access terminal remotely will result in a non-responsive server often falsely indicating the server is down.

## Cause

All servers use a 3-5-10 brute-force deterrent mechanism: **three** invalid logins in a **five** minute window results in a **ten** minute block. After ten minutes the block automatically expires and you may login again to the service.

## Solution

Use the right credentials, dummy! See KB: [Accessing terminal](https://kb.apnscp.com/terminal/accessing-terminal/).
