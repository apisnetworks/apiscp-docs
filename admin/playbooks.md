---
layout: docs
title: Playbook Introduction 
group: admin
lead: An introduction to Ansible Playbooks used to deploy incremental platform idempotent changes.
---
* ToC
{:toc}
apnscp uses [Ansible](https://www.ansible.com), an automation tool, to configure the hosting platform in a predictable, replayable process. Configuration processes, called Playbooks, run in an idempotent manner, that is to say they can be run multiple times without altering the state of an altered machine. Ansible is used not only to initialize the machine and install apnscp, but to ensure platform consistency checks whenever updates are deployed.

Playbooks are located in `resources/playbooks`. `ansible-playbook` orchestrates these playbooks. To run every playbook from the start to restore the machine to a pristine state, the following command is used:

```bash
ansible-playbook -c local resources/playbooks/initialize.yml
```

Ansible will ensure all necessary packages are installed, replicate to the *virtual filesystem template*, update apnscp, install MySQL, set a root password, alter Postfix configuration, populate appliance database, and so on.

## Running segments

Tasks are often grouped logically by tags. Available tags can be enumerated from a playbook using `--list-tags`:

```bash
ansible-playbook --list-tags resources/playbooks/initialize.yml
```

## Running hotfixes

Hotfixes are deployed with automated updates from yum as [scriptlets](http://ftp.rpm.org/max-rpm/s1-rpm-specref-scripts.html), hooks bundled into packages that execute after a package is installed/updated. Hotfixes are installed under `resources/playbooks/roles/hotfixes/YYYYMMDD.yml`. To run all hotfixes from November 2017, use [shell wildcards](http://www.tldp.org/LDP/GNU-Linux-Tools-Summary/html/x11655.htm):

```bash
ansible-playbook -c local resources/playbooks/roles/hotfixes/201711*.yml
```

{%callout info %}

Multiple packages may be issued same day bundling individual hotfixes. In such circumstances, an identifier will be infixed to the filename, e.g. 20171113-apache-cve.yml (shell wildcards still useable). To associate a Playbook with a package, use `rpm -qf`

```bash
rpm -qf resources/playbooks/roles/hotfixes/20171113-apache-cve.yml
# RPM returns apache-2.4.27.apnscp.el7.centos.x86_64.rpm 
```

{%endcallout%}