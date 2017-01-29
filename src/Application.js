/**
 * Created by alexey2baranov on 8/30/16.
 */
"use strict";

import Connection from './Connection'
let config = require("./../cfg/main")[process.env.NODE_ENV];
let model = require("./model");

export default class Application {
  constructor() {
    this.log= require("loglevel").getLogger(this.constructor.name)
    this.state = undefined
    this.user = null
    this.body = null
  }

  static getInstance() {
    if (!Application.instance) {
      Application.instance = new Application()
    }
    return Application.instance
  }

  setBody(value) {
    this.body = value
  }

  /**
   *
   * @param email
   * @param password
   */
  auth(email, password) {
    return new Promise((res, rej)=>{
      let connection = Connection.getInstance({
        authid: email,
        onchallenge: function (session, method, extra) {
          return password
        }
      })

      connection.onopen = async(session, details) => {
        this.log.info("connection opened")
        /**
         * success auth
         */
        if (!this.user) {
          session.prefix('api', 'ru.kopa')
          this.user = await model.Kopnik.getByEmail(email)
          res(this.user)
        }
      }

      connection.onclose = async(reason, details) => {
        this.log.info("connection closed", reason, details)
        /**
         * fail auth
         */
        if (!this.user){
          rej(reason)
        }
      }

      connection.open()
    })

  }

  getState(){
    const result= {
      state: this.state,
      body: `${this.body.constructor.name}:${this.body.id}`
    }
    return result
  }


  setState(state){
    if (state.body){
      let [bodyType, BODY]= state.body.split(":")
      this.body= model[bodyType].getReference(BODY)
    }
    else{
      this.log.debug("state.body missed")
    }

    if (state.stete){
      this.state= state.state
    }
    else{
      this.log.debug("state.state missed")
    }
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
