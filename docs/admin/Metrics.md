---
title: Metrics
---

Metrics periodically log a variety of attributes about your server that can be used by ApisCP to support decision making. This system forms the distributed analytics portion of DAPHNIE: the Distributed Analytics and Predictive Hot, Naive Isostatic Economizer that performs transient server optimizations to help you squeeze the most out of your server.

## Enabling metrics

Metrics are enabled by default beginning in v3.1.40. Enable *[telemetry]* => *enabled* using cp.config [Scope](Scopes.md).

```bash
cpcmd scope:set cp.config telemetry enabled true
```

Metrics will begin collecting every cron cycle (*[cron]* => *resolution*) with the first collection occuring immediately. Data is stored in PostgreSQL using [TimescaleDB](https://timescale.com) in an efficient format. Data is periodically collapsed as it ages to reduce storage requirements.

Two metric types are logged: **value** and **monotonic**. Value can be any integer value. Monotonic must always be increasing or decreasing but not both. Uptime and network traffic are excellent examples of monotonic sequences.

## Querying

A few API commands are exposed to fetch metrics.

`telemetry:metrics()`: list all known metrics by attribute.

`telemetry:get(string|array $attr, ?int $siteid)`: get the last recorded value for a metric. The metric must have been logged within the last 12 hours.

`telemetry:range(string|array $attr, int $beginTs, ?int $endTs, ?int $siteid, bool $sum = true)`: fetches all recorded values between *$beginTS* and *$endTS*. Specifying 0 for *$beginTS* will fetch all records since recording began. *$sum* controls whether records are rolled up into a sum/average (montonic/value).

## Storage

Metrics older than 1 week are periodically compressed. Each metric type is compressed differently:

**Monotonic**: when collapsed, the *most recent* value is used.  
**Value**: when collapsed, the value is averaged over the collapse window.  

::: warning
Using the most recent value for monotonic series causes the oldest timestamp to shift on collapse.
:::

Compression chunk intervals are determined by *[telemetry]* => *compression_chunk*. Larger intervals require less storage but lose details. By default, 1 hour intervals are chosen for data older than 1 week, which reduces metric storage requirements by 10x. Once compressed, all data points in that window is replaced by a single data point.

Additionally, **archival compression** may be enabled for data older than 48 hours via *[telemetry]* => *archival_compression*. Archival compression formats data as a contiguous segments in PostgreSQL that *may not* be altered (INSERT, DELETE, UPDATE) without first decompressing all data. Data may be removed while in archival compression. `telemetry:decompress_all()` synchronously inflates all archived chunks. Once updated, enable compression once again using `telemetry:reinitialize_compression()`.

```bash
# Show metric storage usage
cpcmd telemetry:db-usage
# Show metric archival compression usage
cpcmd telemetry:db-compression-usage
```

::: tip
Archival compression is useful when hosting hundreds of sites, but also requires decompression before a site may be safely removed. This can add several seconds to a `DeleteDomain` task, which is unacceptable overhead when invoked manually. If enabling archival compression, be sure to configure periodic account removals via **opcenter.account-cleanup** [Scope](Scopes.md) that automatically removes suspended accounts in batch suspended more than *n* days ago.
:::

## Adding metrics

Use `config/custom/boot.php` to add anonymous metrics on the fly. First, ApisCP needs to be made aware of the metric namespace through preloading.

```php
<?php declare(strict_types=1);
    // config/custom/boot.php
    apnscpFunctionInterceptor::register(
        Mymetric::class,
        '@custom/Mymetric.php'
    );
    \Daphnie\MetricBroker::register(Mymetric::class, 'mymetric');
```

:::tip
**@custom** is a path alias to config/custom/
:::

::: warning
Metric attributes are named automatically from the class. 'mymetrics' may be safely omitted from this example as it is the implied name. If you intend on using a different attribute name, this metric must be explicitly referenced.
:::

```php
<?php declare(strict_types=1);
	// config/custom/Mymetric.php
    class Mymetric extends \Daphnie\Metric
    {
        public function getLabel(): string
        {
            return 'Accumulated time';
        }

        public function getType(): string
        {
            return \Daphnie\Metric::TYPE_MONOTONIC;
        }
        
        public function metricAsAttribute(): string {
            // if metric attr were named anything other than 'mymetric'
            // this would need to return that name
            return parent::metricAsAttribute();
        }
    }
```

"mymetric" is now a registered metric, but it needs to collect data to be useful. Two approaches exist to log data, explicitly or implicitly. 

### Explicit metric logging

Let's say we have a custom [surrogate module](../PROGRAMMING.md#extending-modules-with-surrogates). Create a new API method called logit(), being mindful to add module permissions in the `$exportedFunctions` property.

```php
public function logit(): void
{
    if (!TELEMETRY_ENABLED) {
        return;
    }

    $attr = (new Mymetric())->metricAsAttribute();
    $collector = new \Daphnie\Collector(PostgreSQL::pdo());
    // add parameters: attribute name, optional site ID, integer value
    $collector->add($attr, null, time());
}
```

:::tip
Placing collection inside `_cron()` allows it to periodically collect data (see *[cron]* => *resolution* [Tuneable](Tuneables.md)).
:::

```bash
cpcmd mymodule:logit
# Now get the last recorded metric value
cpcmd telemetry:get mymetric
# Add a 10 second wait...
sleep 10
cpcmd mymodule:logit
# Get accumulated time in seconds, ~10
cpcmd telemetry:range mymetric 0
```

### Implicit metric logging

The `AnonymousLogging` interface can be bolted onto the metric to run whenever `telemetry::_cron()` runs. This provides a less invasive means of logging data. Let's adapt the previous examples by altering `boot.php` and `Mymetric`:

```php
// config/custom/boot.php
\Daphnie\Collector::registerCollection(Mymetric::class, 'mymetric');
```

```php
<?php declare(strict_types=1);
	// config/custom/Mymetric.php
	class Mymetric extends \Daphnie\Metric implements \Daphnie\Contracts\AnonymousLogging
	{
		public function getLabel(): string
		{
			return 'Accumulated time';
		}

		public function getType(): string
		{
			return \Daphnie\Metric::TYPE_MONOTONIC;
		}

		public function metricAsAttribute(): string
		{
			// if metric attr were named anything other than 'mymetric'
			// this would need to return that name
			return parent::metricAsAttribute();
		}

		public function log(\Daphnie\Collector $collector): bool
		{
			$collector->add($this->metricAsAttribute(), null, time());

			return $collector->sync();
		}
	}
```

Check back after 10 minutes and the sum will change,

```bash
cpcmd telemetry:range mymetric 0
```

