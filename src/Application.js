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

    /**
     * Начальное состояние приложения
     * @type {undefined}
     */
    this.startState= undefined
  }

  static getInstance() {
    if (!Application.instance) {
      Application.instance = new Application()
    }
    return Application.instance
  }

  goTo(value){
    this.state=Application.State.Main
    this.setBody(value)
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
    /**
     * перед авторизацией сбрасываем предыдущие конекшены, которые могут быть с пустыми логинами от куки-заходов
     */
    if (Connection._instance && Connection._instance.isOpen){
      throw new Error("Повторная авторизация")
    }
    else{
      Connection._instance=null
    }

    return new Promise((res, rej)=>{
      let connection = Connection.getInstance({
        authid: email,
        onchallenge: function (session, method, extra) {
          return password
        },
        captchaResponse: 12345678
      })

      connection.onopen = async(session, details) => {
        this.log.info("connection opened")
        /**
         * success auth
         */
        if (!this.user) {
          session.prefix('api', 'ru.kopa')
          this.user = await model.Kopnik.getByEmail(details.authid)
          this.log.info("user", this.user)
          res(this.user)
        }
      }

      connection.onclose = async(reason, details) => {
        Object.assign(details, {onclose_reason: reason})
        this.log.error("connection closed. details:", details)
        /**
         * fail auth
         */
        if (!this.user){
          rej(details)
        }
      }

      connection.open()
    })

  }

  getState(){
    const result= {}

    result.state= this.state
    if (this.body){
      result.body= `${this.body.constructor.name}:${this.body.id}`
    }
    return result
  }


  setState(state){
    if (state.state){
      this.state= state.state
    }
    else{
      this.state=Application.State.Main
    }

    /**
     * если соединения нет, то на страницу Auth
     */
    if (this.state!= Application.State.Registration &&  this.state!= Application.State.Auth && !Connection.getInstance().isOpen){
      this.state= Application.State.Auth
      this.log.info("redirect to Auth")
      require("./StateManager").default.getInstance().pushState()
      return false
    }

    if (state.body){
      let [bodyType, BODY]= state.body.split(":")
      this.body= model[bodyType].getReference(BODY)
    }
    else if (this.state== Application.State.Main){
      this.body= this.user.dom
    }
  }
}

/**
 * состояние приложения в текущий момент
 * больше нужно для сохранения состояния
 * @type {{Auth: string, Registration: string, Main: string}}
 */
Application.State = {
  Auth: "auth",
  Registration: "registration",
  Main: "main",
  Verification: "verification"
}
