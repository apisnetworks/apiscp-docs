---
title: "Server reports little free system memory"
date: "2016-05-03"
---

## Overview

Accessing `free` from the [terminal](https://kb.apnscp.com/terminal/accessing-terminal/) or **Reports** > **Server Info** within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) reports a small sliver of total system memory as free or available. For example, below is the output from `free` on a [4th generation](https://kb.apnscp.com/platform/determining-platform-version/) server:

                     total     used    free shared **buffers**   **cached**
Mem:              16540796 13011700 3529096      0  135404 10609292
-/+ buffers/cache: 2267004 14273792
Swap:              2104496    56884 2047612

## Cause

Servers are very efficient at managing memory. Memory that is not occupied by a process may be utilized to store file data (_buffers_) and metadata (location on disk, size, owner, etc reflected in _cached_). If there is unbound memory available on a server, it will be used by the server to boost local filesystem performance (_buffers_ _and cached as seen above_). Newer platforms will also donate free memory to other cloud instances on a server to boost performance. Likewise when memory is needed by a process, memory is donated from first _cached_ storage, then _buffers_. On newer platforms, if sibling clouds have memory to donate, then that memory is absorbed. Lastly, if memory cannot be converted from _buffers_, _cached_, or neighboring _clouds_, then the [out-of-memory killer](https://www.kernel.org/doc/gorman/html/understand/understand016.html) is invoked to randomly terminate a process with the highest resident stack size until sufficient memory is available to run the process.
