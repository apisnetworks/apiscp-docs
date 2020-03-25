---
title: "Converting e-mail address types"
date: "2014-11-05"
---

## Overview

In certain situations, an e-mail address that delivers to an account on the server may want to be converted to an e-mail address that forwards externally to another address and vice-versa.

## Solution

1. Login to the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/)
2. Visit **Mail** > **Manage Mailboxes**
3. Under _Change Mode_, select **View/Edit Mailboxes**
4. Select the mailbox to edit by the **edit icon** within the _Actions_ column
    - Hovering your mouse over an entry will display available actions
5. Change **Type** + **Destination** fields respectively
    - To make an e-mail address forward, alter **Type** from L (_local delivery_) to F (_forwarded_)
        - Enter multiple e-mail addresses in the destination text box
        - Each entry is delimited by a comma (",") or enter ("⏎")
        - To make a forwarded e-mail address delivery locally, alter **Type** from F (_"forwarded'_) to L (_"local delivery"_)
        - Select the user account under **Destination**
        - This account maps to a user defined in **User** > **Manage Users**
6. Click **Save**
