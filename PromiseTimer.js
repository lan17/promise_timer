'use strict';

var Bunyan = require('bunyan');

var I = 0;

/**
 * Utility timer object
 * Every time you call timeIt() it will log the timing since
 * last invocation of timeIt() or construction time.
 * @param LOG
 * @constructor
 */
const PromiseTimer = function(options) {

  options = options ? options : {};
  this.LOG = options.LOG;
  if (this.LOG === undefined) {
    I += 1;
    this.LOG = Bunyan.createLogger({
      name: `timer ${I}`,
      level: 'debug'
    });
  }
  this.percentProgressNotificationDelta = Maybe.fromNullable(
    options.percentProgressNotificationDelta)
    .getOrElse(1);

  this.startTime = Date.now();
  this.lastTime = this.startTime;

  this.lastPercentProgress = 0 - this.percentProgressNotificationDelta * 2;

  const printTime = (msg, sec) => this.LOG.info(`${msg} took ${sec} seconds`);

  /**
   * Just print some info message
   * If msg a function then call it and print output
   * @param msg
   */
  this.msg = msg => whatever => {
    if (typeof msg === 'function') {
      this.LOG.info(msg());
    }
    else {
      this.LOG.info(msg);
    }
    return whatever;
  };

  this.timeIt = msg => whatever => {
    printTime(msg, (Date.now() - this.lastTime) / 1000.0);
    this.lastTime = Date.now();
    this.lastPercentProgress = 0 - this.percentProgressNotificationDelta * 2;
    return whatever;
  };

  this.timeOverall = msg => whatever => {
    printTime(msg, (Date.now() - this.startTime) / 1000.0);
    return whatever;
  };

  this.showPercentProgress = msg => percentProgress => {
    if (percentProgress - this.lastPercentProgress > this.percentProgressNotificationDelta)
    {
      this.LOG.info(`${msg} is ${percentProgress}% done`);
      this.lastPercentProgress = percentProgress;
    }
  };
};

module.exports = PromiseTimer;