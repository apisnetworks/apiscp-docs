---
title: "Setting a task to run at startup"
date: "2016-02-02"
---

## Overview

Services or scripts may be set to run upon server start within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) or via [crontab(5)](https://apnscp.com/linux-man/man5/crontab.5.html) from the [terminal](https://kb.apnscp.com/terminal/accessing-terminal/). Either solution requires task scheduling support, which is found on [Developer+](https://apnscp.com/hosting) packages.

### Within the control panel

Visit **Dev** > **Task Scheduler** to add a new routinely scheduled task. Command syntax follows the same as a normal task, but for the time specification, select `@reboot`. The job will start on server start. If there are issues with starting the application or the application fails to remain running, then it will remain down.

### From the terminal

Use `crontab -e` to edit your crontab. Instead of specifying a time (min/hour/day/day of week/day of month), specify `@reboot`, e.g.

`@reboot touch /tmp/restart`
