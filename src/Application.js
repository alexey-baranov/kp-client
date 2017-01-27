/**
 * Created by alexey2baranov on 8/30/16.
 */
"use strict";

import Connection from './Connection'
let config = require("./../cfg/main")[process.env.NODE_ENV];
let model = require("./model");

export default class Application {
  constructor() {
    this.state = undefined
    this.user = null
  }

  static getInstance() {
    if (!Application.instance) {
      Application.instance = new Application()
    }
    return Application.instance
  }

  /**
   *
   * @param email
   * @param password
   */
  auth(email, password) {
    let connection = Connection.getInstance({
      authid: email,
      onchallenge: function (session, method, extra) {
        return password
      }
    })

    connection.onopen = async(session, details) => {
      console.log.info("connection opened")
      this.user = await model.Kopnik.getByEmail(email)

      for (let eachDom = this.user.dom; eachDom; eachDom = eachDom.parent) {
        console.log.debug("loading user dom", eachDom.id)
        await eachDom.reload()
        console.log.debug("loaded ", eachDom.name)
      }
    }

    connection.onclose = async(reason, details) => {
      console.log.info("connection closed");
    }

    connection.open()
  }
}

/**
 * состояние приложения в текущий момент
 * больше нужно для сохранения состояния
 * @type {{Auth: string, Register: string, Main: string}}
 */
Application.State = {
  Auth: "auth",
  Register: "register",
  Main: "main"
}
