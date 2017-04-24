/**
 * Created by alexey2baranov on 9/25/16.
 */

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandel rejection in promise. Reason: ' + JSON.stringify(reason), JSON.stringify(promise));
})

/**
 * прокачка логов
 */
import log from "loglevel"

let originalFactory = log.methodFactory
log.methodFactory = function (methodName, logLevel, loggerName) {
  let rawMethod = originalFactory(methodName, logLevel, loggerName)

  return function () {
    let originalArguments = arguments
    let newArguments = [`[${methodName}]`, `${loggerName ? loggerName : "root"} - `,]

    for (let eachOriginalArgument of originalArguments) {
      newArguments.push(eachOriginalArgument)
    }

    rawMethod.apply(null, newArguments)
  }
}
log.setLevel(log.levels.TRACE); // Be sure to call setLevel method in order to apply plugin

// log.getLogger("StateManager").setLevel("info")
log.getLogger("location.vue").setLevel("info")


// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import MuseUI from 'muse-ui'

import Application from './Application'
import applicationView from './view/application.vue'
import AuthenticationError from "./AuthenticationError"
import Grumbler from './Grumbler'
import config from "../cfg/main"
import StateManager from './StateManager'

let models = global.models = require("./model")

Vue.use(MuseUI)
Grumbler.getInstance().addEventHandler()

Notification.requestPermission()

/**
 * инициализация application
 */
let application = global.application = Application.getInstance()

global.view = new Vue({
  el: '#application',
  template: "<application id='a' :model='application'></application>",
  data: {
    application
  },
  components: {application: applicationView}
})

/**
 * State management
 */
let stateManager = StateManager.getInstance()
stateManager.application = application
stateManager.applicationView = global.view.$children[0]
stateManager.listen()

/**
 * ошибки подключения к кросбару и серверу
 * будут удалены автоматически после того как приложение подключится
 * @type {Array}
 */
let connectionErrors=[]

application.on("connectionOpen", () => {
  stateManager.popState(location.search.substring(1))
  connectionErrors.forEach(each=>Grumbler.getInstance().removeError(each))
})

application.on("connectionClose", (err) => {
  err.tag= "connectionClose"
  connectionErrors.push(err)
  Grumbler.getInstance().pushError(err)
})

application.authAsPromise()
  .then(user=>{
    log.getLogger("main.js").info("cookie auth")
  },
  err=>{
    if (err instanceof AuthenticationError) {
      log.getLogger("main.js").info("cookie auth fails")
      /**
       * ошибку первого входа не надо показывать потому что это автовход по кукам,
       *  там нет было ни имени пользователя, ни пароля, ни капчи
       */
      Grumbler.getInstance().removeError(err)
    }
    else {
      //ошибка теперь отображается в application.on("connectionClose" )
      // throw err
    }
  })

if (0) {
  /**
   * автозаход
   */
  application.authAsPromise(config.unittest2.username, config.unittest2.password)
    .then(user => {
      application.setBody(user.dom)
      application.state = Application.State.Verification
    })
    .then(() => {
      /**
       * попнуть первое состояние
       * @type {*}
       */
      stateManager.popState(location.search.substring(1))
    })
}
