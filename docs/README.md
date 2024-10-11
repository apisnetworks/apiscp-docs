---
home: true
tagline: Managing an ApisCP platform 
actionText: Get Started →
actionLink: /INSTALL/
features:
- title: Self-healing
  details: >-
   Period integrity checks ensure your platform configuration never deviates from optimal.
- title: Batteries included
  details: >-
   ApisCP bundles 1-click installs, anti-spam, malware, and firewall protection through an in-house architecture.
- title: API driven design
  details: >-
   Everything in ApisCP revolves around its API, which can be called from the panel, command-line, or remotely.
footer: Copyright © 2020 Apis Networks
---

# Introduction

ApisCP is an modern hosting panel + platform that began in 2002 as a panel for Apis Networks. ApisCP runs agentless and is 100% self-hosted. Licenses can be purchased from [my.apiscp.com](https://my.apiscp.com).

## Requirements

- 2 GB RAM
- 20 GB storage
- 1 CPU
- RHEL-based OS:
  - RHEL 7.4+ (EOL)
  - RHEL 8.x
  - CentOS 7.4+ (EOL)
  - CentOS 8.x
  - CentOS Stream 8.x
  - Rocky Linux 8.x
  - AlmaLinux 8.x
- Bare-metal or virtualization (kvm, xen, VMWare, Hyper-V)
- Containers (Virtuozzo, OpenVZ, LXC, Docker) are **not supported**
- [Forward-confirmed reverse DNS](https://en.wikipedia.org/wiki/Forward-confirmed_reverse_DNS), i.e. 64.22.68.1 <-> apnscp.com

## Installation

See [docs.apiscp.com](INSTALL.md). Installation may be customized using the [utility](https://apiscp.com/#customize) on apnscp.com.

## Contributing

Use the [Issue Tracker](https://github.com/apisnetworks/apnscp) to post feature requests.

## License

ApisCP is (c) Apis Networks. All components except for third-party modules and [ApisCP modules](https://github.com/apisnetworks/apnscp-modules) are licensed under a [commercial license](https://bitbucket.org/apisnetworks/apnscp/raw/HEAD/LICENSE). Contact licensing@apisnetworks.com for licensing enquiries. Any dissemination of material herein is prohibited without expressed written consent of Apis Networks.
