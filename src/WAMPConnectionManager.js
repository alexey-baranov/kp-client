/**
 * Created by alexey2baranov on 1/25/17.
 */
"use strict";
import Connection from "autobahn"

let config = require("./../cfg/main")[process.env.NODE_ENV]

export default class {
  /**
   * @returns {Connection}
   */
  static createConnection(username, password) {
    if (this._connection) {
      throw new Error("connection allready created")
    }
    this._connection = new Connection({
      url: `${config.WAMP.schema}://${config.WAMP.host}:${config.WAMP.port}/${config.WAMP.path}`,
      realm: "kopa",
      authmethods: ['ticket'],
      "authid": username,
      onchallenge: function (session, method, extra) {
        return password;
      },
      use_es6_promises: true,
      max_retries: -1,
      max_retry_delay: 5
    })
    return this._connection
  }

  /**
   *
   * @return {Connection}
   */
  static getConnection(){
    return this._connection
  }
}
