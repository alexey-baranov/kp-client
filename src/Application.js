/**
 * Created by alexey2baranov on 8/30/16.
 */
"use strict";
import EventEmitter from "events"
import Cookies from "js-cookie"
import serviceWorkerWebpackPluginRuntime from 'serviceworker-webpack-plugin/lib/runtime'

import AuthenticationError from "./AuthenticationError"
import config from "./../cfg/main"
import Connection from './Connection'
import Grumbler from './Grumbler'
import models from "./model"
import Notifyer from "./Notifier"
import StateManager from "./StateManager"

export default class Application extends EventEmitter {
  constructor() {
    super()
    this.log = require("loglevel").getLogger(this.constructor.name)
    this.state = undefined
    this.user = null
    this.body = null

    /**
     * Начальное состояние приложения
     * @type {undefined}
     */
    this.startState = undefined

    this.serviceWorkerRegistration = null
    this.serviceWorker = null
  }

  static getInstance() {
    if (!Application.instance) {
      Application.instance = new Application()
    }
    return Application.instance
  }

  goTo(value) {
    this.state = Application.State.Main
    this.setBody(value)
  }

  setBody(value) {
    this.body = value
    value.joinedLoaded()
      .then(() => {
        document.title = value.name + " - kopnik.org"
      })
  }

  /**
   * подписка на уведомления
   * внутри auth()
   * {
   *  eventType: "kopaAdd"
   *  data: {id, quesion, owner_id, ...}
   * }
   */
  async subscribeToNotifications() {
    await Connection.getInstance().session.subscribe("api:Application.notification", async(args, kwargs) => {
      try {
        switch (kwargs.eventType) {
          case models.Zemla.event.kopaAdd:
            this.emit(models.Zemla.event.kopaAdd, models.Kopa.getReference(kwargs.data.id))
            break;
          case models.Kopa.event.predlozhenieAdd:
            this.emit(models.Kopa.event.predlozhenieAdd, models.Predlozhenie.getReference(kwargs.data.id))
            break;
          case models.Kopa.event.slovoAdd:
            this.emit(models.Kopa.event.slovoAdd, models.Slovo.getReference(kwargs.data.id))
            break;
        }
      }
      catch (err) {
        Grumbler.getInstance().pushError(err)
      }
    })
  }

  async registerServiceWorker() {
    this.registration = await serviceWorkerWebpackPluginRuntime.register()
    // await registration.update()

    for (let EACH_SERVICE_WORKER of ["active", "waiting", "installing"]) {
      let eachServiceWorker = this.registration[EACH_SERVICE_WORKER]
      if (eachServiceWorker) {
        this.log.info(`${EACH_SERVICE_WORKER} service worker initial state:`, eachServiceWorker.state)
        eachServiceWorker.addEventListener('statechange', (e) => {
          this.log.info(`${EACH_SERVICE_WORKER} service worker state changed:`, e.target.state)
        })
      }
    }

    this.registration.onupdatefound=  () => {
      this.registration.installing.addEventListener('statechange', (e) => {
        this.log.info(`updatefound service worker state changed:`, e.target.state)
      })
    }

    navigator.serviceWorker.oncontrollerchange= () => {
      this.log.info(`navigator.ServiceWorker controller change`)
    }

    await navigator.serviceWorker.ready

    navigator.serviceWorker.onmessage = (event) => {
      let kopa,
        data = event.data

      switch (event.data.eventType) {
        case "kopaAdd":
          kopa = models.Kopa.getReference(data.model.id)
          this.goTo(kopa)
          StateManager.getInstance().pushState()
          break
        case "predlozhenieAdd":
          kopa = models.Kopa.getReference(data.model.place_id)
          this.goTo(kopa)
          StateManager.getInstance().pushState()
          break
        case "slovoAdd":
          kopa = models.Kopa.getReference(data.model.place_id)
          this.goTo(kopa)
          StateManager.getInstance().pushState()
          break
      }
    }

    this.log.debug("push subscription")
    this.pushSubscription= await this.registration.pushManager.getSubscription()
    if (!this.pushSubscription){
      this.pushSubscription= await this.registration.pushManager.subscribe({userVisibleOnly: true})
    }
    if (!this.pushSubscription){
      throw new Error("Ошибка во время подписки на события")
    }

    await this.addPushSubscription()
  }

  async addPushSubscription(){
    await Connection.getInstance().session.call("api:Application.addPushSubscription", [this.pushSubscription])
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
    if (Connection._instance && Connection._instance.isOpen) {
      throw new Error("Повторная авторизация")
    }
    else {
      Connection._instance = null
    }

    return new Promise((res, rej) => {
      let connection = Connection.getInstance({
        authid: email,
        onchallenge: function (session, method, extra) {
          return JSON.stringify({password: password, captchaResponse: captchaResponse})
        },
        captchaResponse: 12345678
      })

      connection.onopen = async(session, details) => {
        try {
          this.log.info("connection opened")
          // alert("connection opened")
          /**
           * success auth
           */
          if (!this.user) {
            session.prefix('api', 'ru.kopa')
            this.user = await models.Kopnik.getByEmail(details.authid)
            this.log.info("user", this.user)
            await this.subscribeToNotifications()
            // registerServiceWorker() улетело в connection.onopen потому что там в конце когда подкиска на пуши должна пройти синхронизация с сервером
            await this.registerServiceWorker()
            this.emit("connectionOpen")
            res(this.user)
          }
        }
        catch (err) {
          rej(err)
        }
      }

      connection.onclose = async(reason, details) => {
        this.log.info("connection closed. reason:", reason, ", details: ", details)
        // alert("connection closed. reason:" + reason + " details: " + JSON.stringify(details))

        /**
         * fail auth
         * если auth уже прошел, то Promise завершился успешно и reject ни к чему не приведет
         */
        if (details.reason == 'wamp.error.authentication_failed') {
          if (details.message.indexOf("org.kopnik.invalid_captcha_status_code") != -1) {
            rej(new AuthenticationError("Вы не прошли Антибот-проверку - проверка временно невозможна"))
          }
          else if (details.message.indexOf("org.kopnik.invalid_captcha") != -1) {
            rej(new AuthenticationError("Вы не прошли Антибот-проверку"))
          }
          else if (details.message.indexOf("incorrect_username_or_password") != -1) {
            rej(new AuthenticationError("Неверное имя пользователя или пароль"))
          }
          else {
            rej(new AuthenticationError(reason + ", " + details.message))
          }
        }
        else if (reason == 'unreachable') {
          rej(new Error("Сервер обмена данными недоступен. Попробуйте зайти позже."))
        }
        else {
          rej(new Error((reason ? (reason + ", ") : "") + details.message))
        }

        this.user = null
        this.body = null
        models.RemoteModel.clearCache()

        /**
         * если сессия потерялась (переключение 4g на wifi или после возвращения браузена из фона)
         * по повторое соединение
         */
        if (reason == "lost") {
          setImmediate(() => {
            connection.open()
          })
        }
      }

      connection.open()
    })
  }

  logout() {
    Connection.getInstance().close()
    Cookies.remove("cbtid");
  }

  getState() {
    const result = {}

    result.state = this.state
    if (this.body) {
      result.body = `${this.body.constructor.name}:${this.body.id}`
    }
    return result
  }


  setState(state) {
    if (state.state) {
      this.state = state.state
    }
    else {
      this.state = Application.State.Main
    }

    /**
     * если соединения нет, то на страницу Auth
     */
    if (this.state != Application.State.Registration && this.state != Application.State.Auth && !Connection.getInstance().isOpen) {
      this.state = Application.State.Auth
      this.log.info("redirect to Auth")
      require("./StateManager").default.getInstance().pushState()
      return false
    }

    if (state.body) {
      let [bodyType, BODY]= state.body.split(":")
      this.body = models[bodyType].getReference(BODY)
    }
    else if (this.state == Application.State.Main) {
      this.body = this.user.dom
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

Application.SEP = "..."
