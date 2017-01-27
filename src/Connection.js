/**
 * Created by alexey2baranov on 1/25/17.
 */
"use strict";
let AutobahnConnection = require("autobahn").Connection

let config = require("./../cfg/main")[process.env.NODE_ENV]

export default class Connection extends AutobahnConnection{
  static defaultOptions={
    url: `${config.WAMP.schema}://${config.WAMP.host}:${config.WAMP.port}/${config.WAMP.path}`,
    realm: "kopa",
    authmethods: ['ticket'],
    "authid": "",
    onchallenge: function (session, method, extra) {
      throw new Error("you should overwrite connection onchallenge to return user password")
    },
    use_es6_promises: true,
    max_retries: -1,
    max_retry_delay: 5
  }

  /**
   * @param {object} options {"authid": username, onchallenge: function (session, method, extra) { return 'xxx' } }
   *
   * @returns {Connection}
   */
  static getInstance(options) {
    if (!Connection._instance) {
      let mixedOptions= Object.assign(Connection.defaultOptions, options)
      Connection._instance = new Connection(mixedOptions)
    }
    return Connection._instance
  }
}
