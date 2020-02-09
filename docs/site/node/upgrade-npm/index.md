---
title: "Upgrade npm"
date: "2015-04-18"
---

## Overview

When attempting to install newer packages on v6+ platforms, npm may complain that it is too old to install a package.

**Sample error:**

Sails.js Installation - Error
--------------------------------------------------------
Your npm-Version is too old:
Sails require npm >= 1.4.0 (you currently have 1.3.6)
Please update the installed npm (Node Package Manager)
 to install Sails.
--------------------------------------------------------

## Solution

Upgrade npm! Issue `npm install -g npm` from the terminal to upgrade npm. A new copy of npm will be installed in `/usr/local/bin` overriding the system default in `/usr/bin`. To localize npm to a particular project directory, omit `-g`: `npm install npm`
