---
title: "Uploads are denied with 406, Not Acceptable"
date: "2016-04-13"
---

## Overview

When uploading a particular file it fails with a 406, Not Acceptable error message.

## Cause

Effective April 9, 2016, all inbound file uploads are [scanned](https://twitter.com/apnscp/status/718846518212501504) for viruses before being saved on the server. If a file is found to contain a virus, it is rejected with a 406, Not Acceptable message. File scanning is performed to reduce the threat of hackers.

## Workarounds

False positives may exist; however, you are strongly urged to verify the integrity of the file by running it through an anti-virus on your machine or through [VirusTotal](https://www.virustotal.com/)'s free, online service. If the file comes back negative, open a ticket in the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) with the attached specimen for further evaluation.
