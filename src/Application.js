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
    this.section = undefined
    this.user = null
    this.body = null

    /**
     * Начальное состояние приложения
     * @type {undefined}
     */
    this.startState = undefined

    this.serviceWorkerRegistration = null
    this.serviceWorker = null
    this.header = ""
    /**
     * идентификатор пуш-подписки.
     * null значит что был отказ подписки
     * @type {undefined}
     */
    this.pushSubscription = undefined
    /**
     * приложение находитяя в состоянии куки-аутентификации
     * нужно для того чтобы не показывать бесячую страницу входа
     * @type {boolean}
     */
    this.cookieAuth = true
    this.zapovedi = [
      {title: "Иди к старшине", description: "В любой непонятной ситуации иди к старшине."},
      {
        title: "Не предотвратил - стал соучастником",
        description: "Если копник стал свидетелем преступления и не предпринял необходимые меры для его предотвращения (не сообщил своему старшине), он становится соучастником этого преступления и подлежит такому же накозанию, как сам преступник."
      }
    ]
  }

  static getInstance() {
    if (!Application.instance) {
      Application.instance = new Application()
    }
    return Application.instance
  }

  setSection(value) {
    this.section = value
    switch (this.section) {
      case Application.Section.Main:
        this.header = "..."
        break
      case Application.Section.Auth:
      case Application.Section.InAuth:
        this.header = "Вход"
        break
      case Application.Section.Registration:
        this.header = "Регистрация"
        break
      case Application.Section.Verification:
        this.header = "Заверения"
        break
    }
  }

  /**
   * Переход оо дереву земель-коп
   * @param value
   * @param restoreScrollItem
   */
  goTo(value, restoreScrollItem = false) {
    this.setSection(Application.Section.Main)
    this.setBody(value)

    value.joinedLoaded()
      .then(() => {
        this.header = value.name
      })

    if (restoreScrollItem) {
      this.emit("restoreScrollItem")
    }
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

    this.registration.onupdatefound = () => {
      this.registration.installing.addEventListener('statechange', (e) => {
        this.log.info(`updatefound service worker state changed:`, e.target.state)
      })
    }

    navigator.serviceWorker.oncontrollerchange = () => {
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
          break
        case "predlozhenieAdd":
          kopa = models.Kopa.getReference(data.model.place_id)
          this.goTo(kopa)
          break
        case "slovoAdd":
          kopa = models.Kopa.getReference(data.model.place_id)
          this.goTo(kopa)
          break
      }
      this.emit("serviceWorkerMessage", event)
    }

    this.log.debug("push subscription")
    this.pushSubscription = await this.registration.pushManager.getSubscription()
    if (!this.pushSubscription) {
      try {
        this.pushSubscription = undefined //это чтобы сообщение о неподписке не вылезло по условию === null
        this.pushSubscription = await this.registration.pushManager.subscribe({userVisibleOnly: true})
      }
      catch (err) {
        this.pushSubscription = null
      }
    }
    if (this.pushSubscription) {
      await this.addPushSubscription()
    }
  }

  async addPushSubscription() {
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
      throw new Error("Повторная авторизация. Авторизованная сессия уже открыта")
    }
    /**
     * такая комбинация возможно если идут повторные попытки подключения под старым логином
     * и нажали кнопку войти под новым логином или даже тем же
     */
    else if (Connection._instance) {
      let prevConnection = Connection._instance
      prevConnection.onopen = () => {
        this.log.info("prev connection opened and will be closed silently")
        prevConnection.close()
      }
      prevConnection.onclose = () => {
        this.log.info("prev connection closed silently")
      }
      Connection._instance = null
    }

    let connection = Connection.getInstance({
      authid: email,
      onchallenge: function (session, method, extra) {
        return JSON.stringify({password: password, captchaResponse: captchaResponse})
      },
      captchaResponse: 12345678
    })

    connection.onopen = async (session, details) => {
      this.log.info("connection opened")
      if (this.user) {
        throw new Error("user must be null")
      }
      session.prefix('api', 'ru.kopa')

      /**
       * ожидание сервера хоть как необходимо
       * потому что когда кросбар запустится,
       * серверу нужно несколько секунд для того чтобы подключиться
       * а это уже несколько секунд пройдет
       *
       * todo: подумать возможно надо пять-десять попыток предпринисать и потом говорить, что сервер недоступен
       */
      while (!this.user) {
        /**
         * пока ждали сервер, отвалился кросбар))
         * в таком случае #onopen() просто прерываем, а событие отправит #onclose() поэтому его тут не эмитим!
         */
        if (!session.isOpen) {
          this.log.info("session was closed while waiting for server start")
          return
        }
        try {
          this.user = await models.Kopnik.getByEmail(details.authid)
        }
        catch (err) {
          if (err.error == "wamp.error.no_such_procedure") {
            this.log.warn("server not started")
            await new Promise(res => setTimeout(res, 1000))
          }
          else {
            throw err
          }
        }
      }

      this.log.info("user", this.user)
      // await this.subscribeToNotifications()

      /**
       * эта строчка должна быть синхронна с this.user= ...
       * иначе внутри application.vue не сработает первый setSidebarHeight()
       */
      this.emit("connectionOpen", this.user)
      /**
       * снимается только после того как выполнено user= ...
       * иначе полезет форма авторизации
       */
      this.cookieAuth=false

      /**
       * registerServiceWorker() прилетело сюда в connection.onopen()
       * потому что внутри registerServiceWorker(), когда идет подкиска на пуши, должна пройти синхронизация с сервером
       * TODO: подумать а почему нельзя оставить здесь только подписку на уведомления, а регистрацию сервис воркера делать один раз
       */
      await this.registerServiceWorker()
    }

    /**
     * не далать этот метод асинк, поотому что если он вернет не null, то не запустится автореконнект
     *
     * @param reason
     * @param details
     */
    connection.onclose = (reason, details) => {
      this.log.info("connection closed. reason:", reason, ", details: ", details)
      this.cookieAuth = false
      this.user = null
      this.body = null
      models.RemoteModel.clearCache()

      //эта секция для кроссбара 0.13
      if (details.reason == 'wamp.error.authentication_failed') {
        if (details.message.indexOf("org.kopnik.invalid_captcha_status_code") != -1) {
          this.emit("connectionClose", new AuthenticationError("Вы не прошли Антибот-проверку - проверка временно невозможна"))
        }
        else if (details.message.indexOf("org.kopnik.invalid_captcha") != -1) {
          this.emit("connectionClose", new AuthenticationError("Вы не прошли Антибот-проверку"))
        }
        else if (details.message.indexOf("incorrect_username_or_password") != -1) {
          this.emit("connectionClose", new AuthenticationError("Неверное имя пользователя или пароль"))
        }
        else if (details.message.indexOf("unverified_registration") != -1) {
          this.emit("connectionClose", new AuthenticationError(`Ваша регистрация еще не заверена. Вероятно вы забыли обратиться к заверителю по вашему региону. Следуйте информационному письму, которое вы получили после регистрации на почту ${email}`))
        }
        else {
          this.emit("connectionClose", new AuthenticationError(reason + ", " + details.message))
        }
      }

      //эта секция для кросбара 17.3
      else if (details.reason && details.reason.indexOf("org.kopnik.invalid_captcha_status_code") != -1) {
        this.emit("connectionClose", new AuthenticationError("Вы не прошли Антибот-проверку - проверка временно невозможна"))
      }
      else if (details.reason && details.reason.indexOf("org.kopnik.invalid_captcha") != -1) {
        this.emit("connectionClose", new AuthenticationError("Вы не прошли Антибот-проверку"))
      }
      else if (details.reason && details.reason.indexOf("incorrect_username_or_password") != -1) {
        this.emit("connectionClose", new AuthenticationError("Неверное имя пользователя или пароль. "))
      }
      else if (details.reason && details.reason.indexOf("unverified_registration") != -1) {
        this.emit("connectionClose", new AuthenticationError(`Ваша регистрация еще не заверена. Вероятно вы забыли обратиться к заверителю по вашему региону. Следуйте информационному письму, которое вы получили после регистрации на почту ${email}`))
      }

      //ниже для обоих кросбаров 0.13 и 17.3
      else if (reason == 'unreachable') {
        this.emit("connectionClose", new Error(`"Сервер обмена данными недоступен. Неудачных попыток: ${details.retry_count}. Повторная попытка подключения через ${Math.round(details.retry_delay)}сек`))
      }
      else if (reason == 'lost') {
        this.emit("connectionClose", new Error(`Нарушена связь с сервером обмена данных.  Неудачных попыток: ${details.retry_count}. Повторная попытка подключения через ${Math.round(details.retry_delay)}сек`))
      }
      else if (reason == 'closed') {
        this.emit("connectionClose", new Error(`connection closed`))
      }
      else if (details) {
        this.emit("connectionClose", new Error("reason: " + reason + ", details: " + JSON.stringify(details).replace(/([:,{}])/g, "$1 ") + `Неудачных попыток: ${Math.round(details.retry_count)}. Повторная попытка подключения через ${details.retry_delay}сек`))
      }

      /**
       * если сессия потерялась (переключение 4g на wifi или после возвращения браузена из фона)
       * по повторое соединение
       */
      //по идее автобан сам должна реопен делать
      /*        if (reason == "lost") {
       setImmediate(() => {
       connection.open()
       })
       }*/
    }

    if (!email) {
      this.cookieAuth = true
    }
    connection.open()
  }

  authAsPromise(email, password, captchaResponse) {
    return new Promise((res, rej) => {
      let onConnectionOpen,
        onConnectionClose

      this.once("connectionOpen", onConnectionOpen = (user) => {
        this.removeListener("connectionClose", onConnectionClose)
        res(user)
      })

      this.once("connectionClose", onConnectionClose = (err) => {
        this.removeListener("connectionOpen", onConnectionOpen)
        rej(err)
      })

      this.auth(email, password, captchaResponse)
    })
  }

  logout() {
    Connection.getInstance().close()
    Cookies.remove("cbtid");
  }

  getState() {
    const result = {}

    result.section = this.section
    if (this.body) {
      result.body = `${this.body.constructor.name}:${this.body.id}`
    }
    return result
  }


  setState(state) {
    if (state.section) {
      this.section = state.section
    }
    else {
      this.setSection(Application.Section.Main)
    }

    /**
     * если соединения нет, то на страницу Auth
     */
    if (this.section != Application.Section.Registration && this.section != Application.Section.Auth && !Connection.getInstance().isOpen) {
      // this.section = Application.Section.Auth
      // this.log.info("redirect to Auth")
      // require("./StateManager").default.getInstance().pushState()
      return false
    }

    if (state.body) {
      let [bodyType, BODY] = state.body.split(":")
      this.goTo(models[bodyType].getReference(BODY))
    }
    else if (this.section == Application.Section.Main) {
      this.goTo(this.user.dom)
    }
  }
}

/**
 * состояние приложения в текущий момент
 * больше нужно для сохранения состояния
 * @type {{Auth: string, Registration: string, Main: string}}
 */
Application.Section = {
  /**
   * Аутентификация на сервере идет в данный момент
   */
  InAuth: "in auth",
  Auth: "auth",
  Registration: "registration",
  Main: "main",
  Verification: "verification"
}

Application.SEP = "..."
