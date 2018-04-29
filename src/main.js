/**
 * Created by alexey2baranov on 9/25/16.
 */

/*process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandel rejection in promise. Reason: ' + JSON.stringify(reason), JSON.stringify(promise));
})*/

/**
 * прокачка логов
 */
import log from "./log"


// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import is from "is_js"
import Vue from 'vue'
import MuseUI from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'
import "bootstrap/dist/css/bootstrap-reboot.css"
import "bootstrap/dist/css/bootstrap-grid.css"
import "bootstrap/dist/css/bootstrap.css"


import Application from './Application'
import applicationView from './view/application.vue'
import AuthenticationError from "./AuthenticationError"
import Grumbler from './Grumbler'
import config from "../cfg/main"
import StateManager from './StateManager'

global.Tether= require('tether')
global.jQuery= global.$= require('jquery')
global.Popper= require("popper.js").default
require ("bootstrap")

if (!is.chrome()){
  throw new Error("need Chrome browser")
}


Vue.use(MuseUI)

let models = global.models = require("./model")

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
  if (err.message!="connection closed") {
    err.tag = "connectionClose"
    connectionErrors.push(err)
    Grumbler.getInstance().pushError(err)
  }
})

application.cookieAuth = false
/* никуда не заходим потому что Кроссбар маст дай!!
application.authAsPromise()
  .then(user=>{
    log.getLogger("main.js").info("cookie auth")
  },
  err=>{
    if (err instanceof AuthenticationError) {
      log.getLogger("main.js").info("cookie auth fails")
      /!**
       * ошибку первого входа не надо показывать потому что это автовход по кукам,
       *  там нет было ни имени пользователя, ни пароля, ни капчи
       *!/
      Grumbler.getInstance().removeError(err)
    }
    else {
      //ошибка теперь отображается в application.on("connectionClose" )
      // throw err
    }
  })
*/

if (0) {
  /**
   * автозаход
   */
  application.authAsPromise(config.unittest2.username, config.unittest2.password)
    .then(user => {
      application.setBody(user.dom)
      application.setSstate(Application.Section.Verification)
    })
    .then(() => {
      /**
       * попнуть первое состояние
       * @type {*}
       */
      stateManager.popState(location.search.substring(1))
    })
}
