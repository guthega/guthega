# guthega

A NodeJS framework for emulating something like AWS Lambda. Sort of.

## Inspiration

* Situations where an explosion of event-based processing resulted in varying qualities of service through varying "back-to-boilerplate" implementations of Java services
* Exponential growth in demand for real-time processing
* The impact on infrastructure demand as a function of the above
* Observations that event-processing is rarely complex and usually means "receive a message, perform a relatively trivial action"
* AWS' [Lambda](https://aws.amazon.com/lambda/) product

## Objectives

* Reduce the implementation to the specific unit of work that needs to be performed when a message is received
* Eliminate the need to build the same boilerplate container/bootstrapper over and over again
* Utilise a runtime with the smallest footprint possible
* Satisfy the 80/20 rule: build a framework that supports the majority of consumption cases where the transactional workload is relatively simple.
* Think. Exercise the grey matter. Have fun doing so.

Originally, the thinking and construction of this began with a desire to understand Kafka and work out what a world might look like where workloads are not served by a JVM. A couple of quick iterations through the composition of the service yielded a way in which multiple sources can be supported - it's not strictly tied to Kafka.

For reference, it's worth pointing out that Confluent has a great framework and collection of adapters in their [Kafka Connect](https://www.confluent.io/connectors/) framework. If you're a Java shop, their documentation and components are well worth a look.

## What is it NOT?

This might not be a fit if your stream processing has advanced requirements, in which case you should look into a more fitting framework such as [Spark](https://spark.apache.org/docs/2.2.0/streaming-kafka-integration.html), [Flink](https://flink.apache.org/), or [Beam](https://beam.apache.org/).

Although inspired by AWS Lambda, in its current shape it is not an auto-scaling infrastructure service. It's still a fairly standard application-based approach, where the running service is optimised and run for a single consumption case. That said, solving the bigger problem is a great idea and may be the subject of future updates.

## Sources and Receivers

What's in a name?

For the sake of understanding the rest of this documentation, and the source code should you choose to look through it, it's worth outlining what certain terms refer to up front.

There are two basic constructs that Guthega makes use of:

* **source**: the communication stream through which messages are received, parsed, and prepared for processing
* **receiver**: the block of code that represents the unit of work (and its configuration & setup) when a message is received through the configured `source`.

## Sample Receivers

There are a few pre-canned receivers that have been implemented to demonstrate the flexibility of the framework. When referring to them, it's important to remember that they are *examples*, and not categorically the only way that you can interface with the backend/s in question.

Example receivers have been implemented for:

* [Kafka](https://github.com/guthega/kafka_receiver)
* [MongoDB](https://github.com/guthega/mongo_receiver)
* [ElasticSearch](https://github.com/guthega/elastic_receiver)
* [Application Log](https://github.com/guthega/log_receiver)

## Implementing a Receiver

The code construct that Guthega depends on is pretty simple. Guthega depends on a simple module definition where:

* The default export is a factory function taking the receiver config as it's sole argument
* The factory function returns a handler function that is executed once per message
* The handler function returns a Javascript promise which promotes up-front thinking about error handling

A copy of the Application Log receiver is included in this repo at `sample/simple.js` as a quick start point.

## Configuring a Receiver

Receivers are configured in a JSON configuration file loaded on server startup through the `--receiver` command line argument. If not specified on service startup, the application will use `./conf/receiver.json` as the default.

At a minimum your configuration file needs to supply a `module` property in yarn/npm name format and a `version` property denoting which version to install from the module repository.

If you're not using the Docker container included in this repo, you will need to cater for the installation of the module dynamically through your own means. Refer to `container/opt/docker-entrypoint.sh` for an example of how this might be done.

If you **are** using the Docker container **and** if your module is located in a repository that's not public NPM (e.g. local Artifactory), you can specify the repo to load from by passing the `NPM_REGISTRY` environment variable to the container on start.

## Instrumentation

Taking a leaf out of AWS Lambda's time-based pricing approach, Guthega uses Node's out-of-the-box performance libraries (see: [perf_hooks](https://nodejs.org/api/perf_hooks.html) and [PerformanceObserver](https://nodejs.org/api/perf_hooks.html#perf_hooks_class_performanceobserver)) to time the execution of a receiver each time a message is received. Execution durations are written to the application log, so you can ingest for operational reporting and, as a level up, a crude means of time-based charging.

Application logging is supported by [Winston](https://github.com/winstonjs/winston), and you can set the log level using `GUTHEGA_LOG_LEVEL` environment variable to a known [Winston log level](https://github.com/winstonjs/winston#logging-levels). Keep in mind that the performance timing logs are written at the `info` level.

## Running Locally

If you're using the standard configuration, before you can run the service, you will need to clone [https://github.com/guthega/confluent-docker](https://github.com/guthega/confluent-docker) and run `docker-compose up`.

With the local backend up and running, there are several yarn scripts that you can run (in a separate terminal window), depending on what type of source you want to use:

* HTTP: `yarn start:http`
* Kafka: `yarn start:kafka`
* Redis PubSub: `yarn start:redis`
* AMQP (e.g. RabbitMQ): `yarn start:amqp`

## Transpiling ES6

This project uses Babel to transpile ES6 code to standard JS:

```
yarn compile
```

## Testing

To run the Mocha-based tests:

```
yarn test
```

Code coverage analysis is provided by istanbul:

```
yarn coverage
```
