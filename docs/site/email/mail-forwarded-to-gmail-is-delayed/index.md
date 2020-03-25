---
title: "Mail forwarded to GMail is delayed"
date: "2015-10-08"
---

## Overview

When creating a [forwarded email](https://kb.apnscp.com/e-mail/creating-a-forwarded-e-mail/) to deliver mail to third-party providers, such as GMail and Live, mail delivery may appear spotty with some messages never arriving.

## Cause

Certain mail providers use internal heuristics to delay or discard email. Many of these heuristics are trade secrets known only to the service provider by design to thwart spam. It carries a side-effect that mail forwarded from our servers, which is forwarded without modification, may be mistaken as spam.

## Solution

Store the email on your hosting account. Then use GMail's POP3 feature to fetch mail from the server. First, convert the email from a [forwarded to physical account](https://kb.apnscp.com/e-mail/converting-e-mail-address-types/) on the server. Then add a [POP3 server](https://support.google.com/mail/answer/21289?hl=en) to GMail, using the [correct credentials](https://kb.apnscp.com/e-mail/accessing-e-mail/), to begin downloading mail from your hosting account. Mail will be deleted upon retrieval ensuring minimal storage usage. Mail is fetched periodically, so there may be delays in receiving mail to your GMail account.

## See Also

- Google.com: [Check emails from other accounts using Gmail](https://support.google.com/mail/answer/21289?hl=en)
- KB: [Converting email address types](https://kb.apnscp.com/e-mail/converting-e-mail-address-types/)
