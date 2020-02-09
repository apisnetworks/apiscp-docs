---
title: "Reducing DNS propagation time"
date: "2014-10-28"
---

In general, allow for 24 hours for DNS to fully propagate. This window may be reduced to 60 seconds or less following proper procedure. You need a fair understanding of DNS records and roughly 5 days to complete the process with minimal downtime.

## Steps

1. Setup the account with Apis Networks, but keep your account opened with your old hosting provider.
2. If you have access to modify DNS TTL (time-to-live) information on your old host, set the values for all records to 60 seconds and skip to step 4.
3. If you do not have access to modify DNS TTL values, then you will need to replicate the DNS on your old host. This is comprised of the A records to your Web site and mail server, and MX records for handling e-mail delivery. You may lookup the information using the common program [dig](http://en.wikipedia.org/wiki/Domain_Information_Groper) or through a Web-based interface like "[DNS Records](http://network-tools.com/default.asp?prog=dnsrec&host=%20Network-Tools)".
4. First lookup the `A` record for your domain name, i.e. `apiscp.com`. Next, lookup the value for the www subdomain, i.e. `www.apiscp.com`. Copy down the IP addresses for these two records and replace the DNS records in **DNS** > **DNS Manager** with the old values. Change the _TTL_ field from the default value (typically `86400` seconds – 1 day) to `60` (60 seconds).
    - Optionally, if you have any subdomains, e.g. `mail.apiscp.com` or `forums.apiscp.com`, then look up the A records associated with these hosts and add them to the DNS Manager. For the sake of brevity, you may use the wildcard `A` record named `*`. This maps every subdomain _not explicitly named_ to the IP address defined in **DNS Manager**.
    - Change the nameservers to `ns1.apiscp.com` and `ns2.apiscp.com` through the registrar of your domain, then wait 48 hours for nameserver changes to propagate and the new TTL values to appear.
5. Login to apnscp esprit and copy down the IP address listed under **Account** > **Summary** > **General** > **IP Address**. This is the IP address of your account on Apis Networks. The mail server and Web server addresses both point to this address.
6. Visit **DNS** > **DNS Manager** 2-3 days later and change the TTL values back to their default value of `86400` seconds and replace all occurrences of the old IP address with the value listed in apnscp esprit. Once the changes have been made to DNS Manager you will be accessing your account with Apis Networks as will everyone else. The 24 hour window has been reduced to 60 seconds, which in turn mitigates the inevitable downtime of switching hosting providers. Make sure you have anything setup properly on the server before switching over, because your site will be live at that time.

## Example

Let's change apiscp.com hosted elsewhere!

Information is taken from [network-tools.com](http://network-tools.com/default.asp?prog=dnsrec&host=apiscp.com%20network-tools.com):

- apiscp.com, www.apiscp.com: IP address is 4.2.12.250
- apiscp.com MX record: mail.apiscp.com with a priority of 10
- mail.apiscp.com: IP address is 4.2.12.250

Given that information, perform these steps within the **DNS Manager** :

- Change the www.apiscp.com and apiscp.com A records to 4.2.12.250
- Set TTL value for both A records to 60
- Change the apiscp.com MX record to mail.apiscp.com
    - If an A record named mail.apiscp.com does not exist, create it with the IP address 4.2.12.250 otherwise replace the value
- Change nameservers to ns1.apiscp.com and ns2.apiscp.com
- After 48 hours change all occurrences of 4.2.12.250 to the account's IP address – 64.22.68.61 in this case

## See also

- KB: [How does DNS work?](https://kb.apiscp.com/dns/dns-work/ "How does DNS work?")
