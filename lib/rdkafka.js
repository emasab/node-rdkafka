/*
 * node-rdkafka - Node.js wrapper for RdKafka C/C++ library
 *
 * Copyright (c) 2016 Blizzard Entertainment
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE.txt file for details.
 */

var KafkaConsumer = require('./kafka-consumer');
var Producer = require('./producer');
var HighLevelProducer = require('./producer/high-level-producer');
var error = require('./error');
var util = require('util');
var lib = require('../librdkafka');
var Topic = require('./topic');
var Admin = require('./admin');
var features = lib.features().split(',');

module.exports = {
  Consumer: util.deprecate(KafkaConsumer, 'Use KafkaConsumer instead. This may be changed in a later version'),
  Producer: Producer,
  HighLevelProducer: HighLevelProducer,
  AdminClient: Admin,
  KafkaConsumer: KafkaConsumer,
  createReadStream: KafkaConsumer.createReadStream,
  createWriteStream: Producer.createWriteStream,
  CODES: {
    ERRORS: error.codes,
  },
  Topic: Topic,
  features: features,
  librdkafkaVersion: lib.librdkafkaVersion,
}
