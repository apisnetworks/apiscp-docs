---
title: "Scripting with Beacon"
date: "2017-02-12"
---

![](https://kb.apnscp.com/wp-content/uploads/2017/02/beacon.png)

Beacon is a scripting companion to [apnscp](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) that provides a simple interface to interacting with more than [2,000 commands](http://api.apnscp.com/docs/) exposed in apnscp. If apnscp can do it so can you, minus a pretty interface of course! Beacon may also be downloaded from our [github repo](https://github.com/apisnetworks/beacon).

## Getting Started

Beacon requires an API key for authentication. Visit **Dev** > **API Keys** within [apnscp](https://kb.apnscp.com/control-panel/logging-into-the-control-panel/) to create your API key. On first use, specify `--key` to set the key:

`beacon exec --key=AAAA-BBBB-CCCC-DDDD common_get_web_server_name`

If everything went as expected, your domain will be printed out.

Once the key is set, you can skip --key=... unless you change the key again, in which case specify --key=... and **\--set** to overwrite the key. If you're running Beacon on your desktop to interact with apnscp, use --key=... in conjunction with **\--endpoint**\=https://launchpad.url.in.the.panel:2083/soap. Your endpoint URI is provided in **Dev** > **API Keys**.

## Command Format

Each Beacon command consists of the imperative, `exec`, followed by the module name + method name, both in lowercase and delimited by an underscore. For example, to check system load average, which is exposed as "[get\_load](https://github.com/apisnetworks/apnscp-modules/blob/master/modules/common.php)" in the "Common" module, it is formatted as common\_get\_load:

`beacon exec common_get_load`

Which will return an array of three elements, 1, 5 and 15-minute load averages.

## Parameters

Parameters, if necessary, follow command invocation. Primitives are simply passed as-is observing shell [special characters](http://tldp.org/LDP/abs/html/special-chars.html) and [variable interpolation](http://tldp.org/LDP/abs/html/parameter-substitution.html) rules. When working with booleans, use "0" instead of "false". Omitted parameters must be explicitly specified with an empty string (""). Arrays may either be formatted with or without its numeric indices. Hash keys precede the value. Arrays and hashes are enclosed with "\[\]", infinitely nested, and hash keys are postfixed with a colon.

### Primitive examples

`beacon exec sql_create_mysql_database test beacon exec common_get_service_value siteinfo admin_user beacon exec file_chown /var/www/myfile.txt myadmin 1`

### Array/hash examples

`beacon exec file_set_acls /var/www/ myotheruser rwx [recursive:1] beacon exec sql_create_mysql_database foobar beacon exec wordpress_update_themes mydomain.com "" [avada,twentyseventeen]`

## Interpreting Responses

By default, Beacon presents itself in human-readable format with [print\_r](http://php.net/print_r). Use `--format=json` to output the result as JSON and as bash-friendly arrays, `--format=bash:`

`$ beacon exec --format=json common_get_load` `{"1":"0.52","5":"0.82","15":"0.94"} $ beacon exec --format=bash common_get_load` `(['1']='0.47' ['5']='0.81' ['15']='0.94')`

No trailing EOL marker is included in the actual output for ease of parsing.

## Chaining

Chaining is the real magic in Beacon. By mixing shell data types and Beacon, it's easy to store output and work with it.

### Checking if all WordPress domains are current

Iterate over all domains. Check each domain if WordPress is current, update if not.

```
# () also works in lieu of declare -a...
```

### Create an addon domain, then install WordPress or Drupal onto it

Creates a new addon domain, then installs WordPress, Drupal, or any [web app](https://kb.apnscp.com/control-panel/detecting-a-web-application/). "${n,,}" takes the parameter _n _and converts to lowercase in bash v4+ using [case modifiers](http://tldp.org/LDP/abs/html/parameter-substitution.html#PARAMSUBREF).

function newdomain {
    domain=${1,,}
    app=${2,,}
    path=/var/www/${domain}
    beacon exec aliases\_add\_shared\_domain $domain $path
    beacon exec aliases\_synchronize\_changes
    beacon exec ${app}\_install $domain 
}

## Introspection

Sometimes the publicized name isn't too clear. Use show for code introspection. Introspection fetches code from our [GitHub repository](https://github.com/apisnetworks/apnscp-modules/tree/master/modules) and uses reflection to get an accurate representation.

`beacon show common_get_load`

/\*\*
 \* array get\_load (void)
 \*
 \* @privilege PRIVILEGE\_ALL
 \* @return array returns an assoc array of the 1, 5, and 15 minute
 \* load averages; indicies of 1,5,15
 \*/
public function get\_load()
{
        $fp = fopen('/proc/loadavg', 'r');
        $loadData = fgets($fp);
        fclose($fp);
        $loadData = array\_slice(explode(" ", $loadData), 0, 3);
        return array\_combine(array(1, 5, 15), $loadData);
}
