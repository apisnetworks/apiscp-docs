---
title: Metrics
---

Metrics periodically log a variety of attributes about your server that can be used by ApisCP to support decision making. This system forms the distributed analytics portion of DAPHNIE: the Distributed Analytics and Predictive Hot, Naive Isostatic Economizer that performs transient server optimizations to help you squeeze the most out of your server.

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

