---
title: Majordomo
---

## Delivery lifecycle
**Setup:** assuming a mailing list named *test-list@apnscp.com* and membership consisting of *andy@apisnetworks.com, matt@apisnetworks.com*. Users may be added within ApisCP via Mailing Lists > Edit > Edit Membership

1. Mail is received on the list name from an authorized sender
2. List name is a system alias that expands to the Majordomo wrapper, e.g. `env HOME=/usr/lib/majordomo /usr/lib/majordomo/wrapper resend -C /home/virtual/site1/fst/etc/majordomo-apnscp.com.cf -l test-list -h apnscp.com test-list-outgoing+apnscp.com`
3. For each user in /var/lib/majordomo/lists/NAME, an email is generated

### Simulating a delivery

