---
title: "Handling a hijacked account"
date: "2015-07-04"
---

## Overview

This is a general document on what happens when an account is compromised, how it is compromised, and policies pertaining to resolving an account flagged for sending spam.

## How does an account get compromised?

Accounts are compromised through a variety of clever engineering tactics. Just as personal software has become more powerful and smarter over the last decade, so too have the tools hackers use to compromise accounts.

### E-Mail

Most commonly, passwords are compromised through trial-and-error from a distributed botnet controlled by a single entity. This is called a [command-and-control](https://en.wikipedia.org/wiki/Botnet) system whereby thousands of infected machines carry out the request of a single user.  These machines periodically try random username/passwords across millions of servers and report back any successful login. Eventually, if a password is weak enough, these infected machines report back a hit and your account falls under control of a hacker.

### Websites

Just like e-mail, command-and-control botnets crawl websites looking for vulnerable software. Different frameworks (WordPress, Joomla, Drupal, Ruby on Rails) create consistent code and use consistent login portals. Crawlers try a variety of URL patterns to determine what a site is running.

**Example:** if accessing `http://example.com/wp-admin` returns a  web page with a login form, then example.com is probably running WordPress, because /wp-admin is the administrative login location for WordPress. Now the attacker knows what [exploits](https://cve.mitre.org/cgi-bin/cvekey.cgi?keyword=wordpress) to try.

Once an exploit has been successfully leveraged, the attacker has the ability to run any malicious code, including editing files in place, where [permissions permit](https://kb.apnscp.com/php/writing-to-files/), to install new backdoors. Whenever a website is hacked, the only safe solution is to reinstall your software from scratch and next time keep current with software updates.

#### What does a backdoor look like?

Backdoors are typically elusive, obfuscated code designed to confuse whoever reads it. These backdoors are almost always added at the top of infected files so as to not affect how a program, like WordPress, operates. Backdoors come in a variety of forms. Some websites below have done a great job curating backdoor samples.

**Website backdoor resources**

- [Examples of website backdoors](http://aw-snap.info/articles/backdoor-examples.php)
- [PHP Backdoors: Hidden with clever use of extract function](https://blog.sucuri.net/2014/02/php-backdoors-hidden-with-clever-use-of-extract-function.html)
- Backdoor examples [1](https://kb.sucuri.net/malware/signatures/php.backdoor.arakbali.001), [2](https://kb.sucuri.net/malware/signatures/php.backdoor.array.001), [3](https://kb.sucuri.net/malware/signatures/php.backdoor.b374k-shell.001), [4](https://kb.sucuri.net/malware/signatures/php.backdoor.base64.001), [5](https://kb.sucuri.net/malware/signatures/php.backdoor.pregreplace.012), [6](https://kb.sucuri.net/malware/signatures/php.backdoor.gzinflate.002)...

## Avoiding hacks

You can easily avoid becoming a victim by being smart with your account. Always use anti-virus software, keep your anti-virus software current, and follow these additional steps:

### E-Mail

- Avoid creating "throwaway" accounts for testing purposes.
    - Example: never create a user named "test"
- Use strong passwords. Longer passwords are significantly [more difficult](https://www.grc.com/haystack.htm) to guess.
    - Example: instead of the password "gumby", use "gumbyisacharacter1"
    - Explanation: Assuming guessing a-z, 0-9 (36 characters), "gumby" would take ~60 million guesses (36^5). "gumbyisacharacter1" would require 1.03 x 10^28 guesses to discover. It's significantly more secure and easy to remember. _This version will not be compromised by brute-force_.
- Never use your username in a password.
    - Example: if you create a user named "purchasing", don't set the password to "purchasing1" or even "purchasing99"
- **Always use anti-virus software**. Some trojans (e.g. "[PokerAgent](http://blog.eset.ie/2013/01/29/trojan-stole-login-credentials-of-over-16000-facebook-users/)") simply collect login credentials and send them back to the control server without altering anything else. These are impossible to detect without anti-virus software.

### Websites

- Use [permission](https://kb.apnscp.com/guides/permissions-overview/) judiciously. PHP operates as a separate user and requires permission to [write to files](https://kb.apnscp.com/php/writing-to-files/) on your account. It may be easier to change permissions on every file, but this is very dangerous. An attacker can modify any file on your account once compromised requiring you to reinstall the software from scratch, since any file could potentially be compromised resulting in further security violations.
- Always update your software. Exploits do happen. Updating [WordPress](https://kb.apnscp.com/wordpress/updating-wordpress/) and [Drupal](https://www.drupal.org/node/1494290) is extremely easy.
    - If you're afraid of breaking something, we can update your software to the latest version for a one-time $15 fee.
- Limit the number of plugins you use on your site. Not everyone is a competent programmer. Even competent programmers make mistakes. **Always use plugins that are actively maintained**.
- **Never use pirated software** ("nulled" themes). These themes are sometimes injected with a [malicious code](https://blog.sucuri.net/2015/05/fake-jquery-scripts-in-nulled-wordpress-pugins.html), like [CryptoPHP](http://www.pcworld.com/article/2853192/over-23000-web-servers-infected-with-cryptophp-backdoor.html) to turn your website into a backdoor.

## Cleanup

All cleanups impose a **mandatory $15 fee**. This is to reimburse our time spent removing spam from the server and taking steps to help you secure your service. Fees are charged automatically. Failure to collect the fee will result in a suspension of service if unpaid after 72 hours.

### E-Mail

We participate in a variety of [feedback loops](https://en.wikipedia.org/wiki/Feedback_loop_(email)). When spam is reported from your e-mail address, we take steps to isolate and remove it from our network. This includes purging all mail in our mail queue sent by the affected user. Your password will be changed to a random password. You will be required to change the password for the affected user to a new password via **User** > **Manage Users** within the [control panel](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/). _Never reuse the same password!_

### Websites

The offending malware is removed from your site. Permissions, if too liberal, thereby allowing write-access to anywhere on your account, are tightened to prevent recurring attacks. If we cannot reasonably protect your site without your intervention, web access is revoked pending a software update.

If an update is necessary, permissions are changed on the [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/) of the offending website revoking access to the web server (0700 permission mode). This prevents access to your website to prevent further attacks until you can update the offending software or resolve whatever vulnerability enabled the attack (usually it is [outdated software](https://cve.mitre.org)). Once you have updated software, [relax permissions](https://kb.apnscp.com/guides/permissions-overview/) by changing it back to 0755. You can do this within the control panel or [FTP](https://kb.apnscp.com/ftp/accessing-ftp-server/).

## Recommended anti-virus software

**Windows**

- [Microsoft Security Essentials](http://windows.microsoft.com/en-us/windows/security-essentials-download)
- [AVG](http://free.avg.com/us-en/homepage)

**Linux**

- [Sophos Anti-Virus](https://www.sophos.com/en-us/products/free-tools/sophos-antivirus-for-linux.aspx)
- [Comodo](https://www.comodo.com/home/internet-security/antivirus-for-linux.php)

**Mac**

- [Avast](https://www.avast.com/en-us/free-mac-security)

## Recurring infractions

Spam is a pervasive problem for our clients, as well as us. We use the same hosting servers that our clients use to operate. It interrupts mail flow and may result in long-term reputation loss, used by some mail filtering engines ([SenderScore](https://www.senderscore.org/), [Barracuda](http://www.barracudacentral.org/reputation), [McAfee](http://www.mcafee.com/us/threat-center.aspx), etc) to silently discard "spam" from legitimate e-mail.

Since e-mail is such a significant medium for business communication now, we have very strict policies on recurring infractions:

- 3 violations in a 90-day period will result in an automatic **24-hour suspension** of service. This is to allow you to take proper steps to secure your network and computers that have access to your accounts on your network. **E-mail and web site** access is **revoked** during this window.
- A fourth violation results in **termination** and forfeiture of any unused hosting credit.
