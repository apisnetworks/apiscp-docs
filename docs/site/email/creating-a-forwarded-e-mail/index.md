---
title: "Creating a forwarded e-mail"
date: "2014-11-04"
---

## Overview

Forwarded e-mails are e-mails that arrive on the server, but instead of delivering to a local user, these messages are passed off to an external e-mail address hosted elsewhere.

## Setting up a forward

1. Visit **Mail** > **Manage Mailboxes** within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/)
2. Enter a new e-mail address name under _Add a New Address_
3. Select one or more domains for which this e-mail is valid
4. Select _Type:_** Forwarded or Multiple Users**
5. Enter one or more e-mail addresses under _Include these external e-mail addresses_
    - Multiple e-mail addresses may be added by separating with a comma (",")
6. Click **Add Address** to finalize change

## Editing existing forwards

1. Visit **Mail** > **Manage Mailboxes** within the [control panel.](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/)
2. Under _Change Mode_, select **View/Edit Mailboxes**
3. Browse to the row with the specified e-mail to edit
    - Actions will not display until mouse is hovered over column
4. Select **Edit** from Actions column
5. Make changes, separating new e-mails with either a comma (",") or return key ("⏎")
6. Click **Save**

## Considerations

Because forwarded e-mails are a touch-and-forward process, receiving mail servers - the address to which an e-mail is forwarded - may delay or reject messages based upon volume, content, and other heuristics known only to the receiving mail servers. Therefore, it is quite common for mail forwarded to a third-party to randomly, at times, incur a severe delay or be blocked altogether. It is for this reason that _alternative methods be used when forwarding to major third-party mail servers like Gmail_ to ensure mail is consistently delivered.

## See Also

- Google.com: [Check emails from other accounts using Gmail](https://support.google.com/mail/answer/21289?hl=en)
- KB: [Mail forwarded to GMail is delayed](https://kb.apnscp.com/e-mail/mail-forwarded-to-gmail-is-delayed/)
- KB: [Converting email address types](https://kb.apnscp.com/e-mail/converting-e-mail-address-types/)
