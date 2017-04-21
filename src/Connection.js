/**
 * Created by alexey2baranov on 1/25/17.
 */
"use strict";
// import EventEmitter from "events"
let AutobahnConnection = require("autobahn").Connection

import config from "./../cfg/main"

export default class Connection extends AutobahnConnection {
  static get defaultOptions() {
    return {
      url: `${config.WAMP.schema}://${config.WAMP.host}:${config.WAMP.port}/${config.WAMP.path}`,
      realm: "kopa",
      authmethods: ["cookie", 'ticket'],
      "authid": "",
      onchallenge: function (session, method, extra) {
        throw new Error("you should overwrite connection onchallenge to return user password")
      },
      use_es6_promises: true,
      max_retries: -1,
      max_retry_delay: 5
    }
  }

  constructor(options) {
    let mixedOptions = Object.assign({}, Connection.defaultOptions, options)
    console.log(mixedOptions)
    super(mixedOptions)

    this.log= require("loglevel").getLogger(Connection.name)

    /*
        this.eventEmitter= new EventEmitter()
        this.onopen= (session, details)=>this.eventEmitter.emit("open", session, details)
        this.onclose= (reason, details)=>this.eventEmitter.emit("close", reason, details)
    */
  }

  /**
   * Обязательные параметры для создания коннекшина
   * {
   *  authid: username,
   *  onchallenge: function (session, method, extra) { return 'xxx' }
   * }
   *
   * @param {object} options
   *
   * @returns {Connection}
   */
  static getInstance(options) {
    if (!Connection._instance) {
      Connection._instance = new Connection(options)
    }
    return Connection._instance
  }

  /**
   * Упрощалка для юнит тестов
   * @return {Connection}
   */
  static getUnitTestInstance() {
    if (!Connection._instance) {
      Connection._instance = new Connection({
        authid: config.unittest2.username,
        onchallenge: function (session, method, extra) {
          return JSON.stringify({password: config.unittest2.password})
        }
      })
    }
    return Connection._instance
  }

  static getAnonymousInstance() {
    if (!Connection.anonymousInstance) {
      Connection.anonymousInstance = new Connection({
        authmethods: ['anonymous',],
      })
    }
    return Connection.anonymousInstance
  }
}
