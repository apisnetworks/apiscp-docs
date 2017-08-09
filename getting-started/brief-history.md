---
layout: docs
title: About apnscp
group: getting-started
lead: A brief history on apnscp and the modern role of hosting.
---

## History

apnscp began in 2003 as a series of patches to Ensim WEBppliance to address insufficiencies or bugs in the design; there were plenty of bugs to uncover. Gradually I began overwriting apps in Ensim, including its dashboard as a means to differentiate Apis Networks from competition. By 2007 the project had grown into a full-time endeavor producing its own platform and [replacing](https://updates.hostineer.com/2007/01/v4-platform-release/) Ensim entirely. apnscp (**Ap**is **N**etwork**s** **C**ontrol **P**anel ) had become the de facto control panel for clients. Multi-tenant Ruby was introduced in 2014 with Python following in 2015 and Node in 2016. By mid-2016 work was well underway to take apnscp public.

![apnscp-1.0-2-2004](/images/apnscp-1.0-2-2004.png)

![ssl-ensim1](/images/ssl-ensim1.gif)

## Shared vs Virtual

Shared hosting aggregates all accounts onto 1 logical instance. A virtualized instance, through VPS, isolates logical instances into virtual instance. Virtual hosting is nothing more than shared hosting with root. You are sharing CPU (vCPU), memory ([memory compaction](https://lwn.net/Articles/368869/)/[ksm](http://www.linux-kvm.org/page/KSM)), network ports ([SR-IOV](https://en.wikipedia.org/wiki/Single-root_input/output_virtualization)) - even storage ([thin provisioning](http://www.linux-kvm.org/images/7/77/2012-forum-thin-provisioning.pdf)) - among several other neighbors except you don't know how many neighbors nor how much they are consuming. To expound upon this concept:

> Imagine you have an orange. This is 1 "instance" or "machine" or "cpu". It's whatever you deem it to be. Now, conceptualize slicing it with a knife. Each orange slice is *1/x* of the original orange. Now, take each orange slice and dole it out to *n* customers. This is virtualization. To each customer, it's a piece of orange. To the orange grower, however, it is a portion of the orange.
>
> Virtualized hosting works much in the same manner. Take a physical piece of hardware, slice it *n* ways and dole it out to customers. Each machine reports load average and run [queue depth](https://en.wikipedia.org/wiki/Run_queue) relative to itself making traditional shared hosting markers meaningless. Virtualized hosting renders 2 viable metrics: steal % and load average. Both are only meaningful if you have another server running an *identical* workload with which to compare. Without such pairing, these numbers are meaningless. If you are within good fortune to implement load balancing and possess 2 machines with an identical workload, here's what they can tell you:
>
> First, **steal%** is the amount of CPU time requested to the hypervisor (physical machine) on a virtualized instance that the hypervisor does not immediately address. Remember, your CPU is virtualized too, so before it can communicate with the physical CPU, it must go through the hypervisor. It's not uncommon on heavy workloads to see a 2-4% steal%. Anything higher than 10% is problematic as 10% of the time a parcel of work is stalled waiting on the CPU to respond. Second is the **load average** (*run queue depth*). A load average tells you how many processes are running on the machine at any given moment. A load average should be no higher than the number of cores on a machine (`grep processor /proc/cpuinfo | wc -l`). If either value is higher than reasonable limits (10.0 for steal% or greater-than *number cores* for load), congestion will occur. Typically load induces steal%. If steal% is high and load low, then you have a congested, oversold hypervisor. 
>
> `iostat 1` is the simplest way to measure both metrics from your terminal.

Because machines vie for processing time among neighboring guests, performance can fluctuate throughout the day. In order to deliver a consistent performance, it's important to minimize the amount of CPU wasted on ancillary tasks, such as brute-force attempts or bots. It is also important to note that the faster a request can be served the less likely another concurrent request would create a resource contention either in accessing same regions of memory or for the web server to spawn another connection slot to handle the request.

### Further reading

*   [Linux Load Averages: Solving the Mystery](http://www.brendangregg.com/blog/2017-08-08/linux-load-averages.html)

## With root comes great responsibility

Virtual hosting undoubtedly provides greater flexibility than traditional shared hosting environments; however it comes with a downside, you are now your own sysadmin. You know, a sysadmin - the guys you never hear about until *something* goes wrong. Even with their bountiful experience, sometimes they - speaking from personal experience - can encounter eclectic scenarios that not even they know how to address.  Sysadmins are the unsung heroes who enable business to flow. Work in a large firm and hardly know your sysadmin? Congratulate him; he's doing an excellent job.

apnscp is not a replacement to a sysadmin nor can it carry out all of the tasks and troubleshooting a sysadmin can, but it does obviate many traditional roles with user management, system hardening, and preventing unwanted intruders. It's a platform we have built for over 15 years with an expectation that I or you can take a vacation and not worry about a mishap shutting down service.
