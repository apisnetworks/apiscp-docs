---
title: "Separating mail to same user, different domain"
date: "2015-01-09"
---

## Overview

Accounts may host multiple domains under one account. In certain circumstances, an e-mail address on one domain must deliver to a different inbox than the same e-mail address on a different domain:

info@_mydomain.com_ must not deliver to the same inbox as info@_myotherdomain.com_

## Solution

Each user within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) (**Users** > **Manage Users**) provides a location to which e-mail named via **Mail** > **Manage Mailboxes** can deliver. Via **Users** > **Create User** to create a new, namespaced user

1. Under _Username_, specify **myd.info**
2. [E-mail login](https://kb.apnscp.com/e-mail/accessing-e-mail/) will be myd.info@mydomain.com
3. _Full Name_ can be any descriptive reminder. For webmail this becomes the default sending name that can be overrode
4. Under _General Service Configuration_ > _E-Mail_, click on **Advanced. **Deselect "_Create e-mail addresses named after user_". Leave other options selected.
    - Failure to do so will result in creation of the e-mail address myd.info@mydomain.com in addition to myd.info@myotherdomain.com
5. Other options under _General Service Configuration_ is at your discretion
    
    \[caption id="attachment\_448" align="alignnone" width="300"\][![Creating a user independent of a conflicting e-mail address.](https://kb.apnscp.com/wp-content/uploads/2015/01/email-separation-user-creation-300x187.png)](https://kb.apnscp.com/wp-content/uploads/2015/01/email-separation-user-creation.png) Creating a user independent of a conflicting e-mail address.\[/caption\]
6. Click **Add User**

 

Now, the user account must be connected to an e-mail address under **Mail** > **Manage Mailboxes**:

1. Under _Add a New Address_, specify **info** for the left-hand value, then select, under _select domain(s)_, **mydomain.com**
2. Under _Type_, select **Single User**. Select **myd.info** user user assignment
    
    \[caption id="attachment\_449" align="alignnone" width="300"\][![Assigning an e-mail address to a conflicting user.](https://kb.apnscp.com/wp-content/uploads/2015/01/email-separation-mailbox-assignment-300x116.png)](https://kb.apnscp.com/wp-content/uploads/2015/01/email-separation-mailbox-assignment.png) Assigning an e-mail address to a conflicting user.\[/caption\]
3. Click **Add Address**

 

## Conclusion

Now info@mydomain.com is assigned to deliver to the user myd.info. [Mail login](https://kb.apnscp.com/e-mail/accessing-e-mail/) will be myd.info@mydomain.com. Repeat the same process for info@myotherdomain.com, perhaps namespacing it as "_mod.info_".

_Namespacing_, discussed earlier, is assigning a short letter-sequence, typically an abbreviation, to a domain or group of users for easy recognition. All e-mail addresses under mydomain.com, namespaced as "_myd._", would appear grouped together under **User** > **Manage Users**. Although not required, it does greatly simplify bulk user management.

You can repeat this process for as many users and for as many domains as you'd like. There is no cap on e-mail addresses nor user accounts.
