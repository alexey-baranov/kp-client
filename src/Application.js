/**
 * Created by alexey2baranov on 8/30/16.
 */
"use strict";

import Cookies from "js-cookie"
import configs from "./../cfg/main"
import Connection from './Connection'
import models from "./model"

let config= configs[process.env.NODE_ENV];

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
   * @param email
   * @param password
   * @param captchaResponse
   */
  auth(email, password, captchaResponse) {
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
          return JSON.stringify({password: password, captchaResponse: captchaResponse})
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
          this.user = await models.Kopnik.getByEmail(details.authid)
          this.log.info("user", this.user)
          res(this.user)
        }
      }

      connection.onclose = async(reason, details) => {
        this.log.info("connection closed. details:", reason, details)
        /**
         * fail auth
         */
        if (!this.user){
          rej(details)
        }

        this.user= null
        this.body= null
        models.RemoteModel.clearCache()
      }

      connection.open()
    })

  }

  logout(){
    Connection.getInstance().close()
    Cookies.remove("cbtid");
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
      this.body= models[bodyType].getReference(BODY)
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

Application.SEP="..."
