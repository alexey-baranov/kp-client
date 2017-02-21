/**
 * Created by alexey2baranov on 9/25/16.
 */

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandel rejection in promise. Reason: ' + JSON.stringify(reason), JSON.stringify(promise));
});

/**
 * прокачка логов
 */
import log from "loglevel"

let originalFactory = log.methodFactory
log.methodFactory = function (methodName, logLevel, loggerName) {
  let rawMethod = originalFactory(methodName, logLevel, loggerName);

  return function () {
    let originalArguments = arguments
    let newArguments = [`[${methodName}]`, `${loggerName ? loggerName : "root"} - `,]

    for (let eachOriginalArgument of originalArguments) {
      newArguments.push(eachOriginalArgument)
    }

    rawMethod.apply(null, newArguments);
  }
}
log.setLevel(log.levels.TRACE); // Be sure to call setLevel method in order to apply plugin

log.getLogger("StateManager").setLevel("info")
log.getLogger("location.vue").setLevel("info")


// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import $ from "jquery"; //global.$=$;
import Vue from 'vue'
import MuseUI from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'
// require('vue-strap/dist/vue-strap-lang.js')
// require('vue-strap/dist/isMobileBrowser.js')

import Application from './Application'
import applicationView from './view/application.vue'
let config = require("../cfg/main")[process.env.NODE_ENV]
let models = global.models = require("./model")
import StateManager from './StateManager'
import Grumbler from './Grumbler'

Vue.use(MuseUI);
Grumbler.getInstance().addEventHandler()

/**
 * инициализация application
 */
let application = global.application = Application.getInstance()

/*
 пробуем авторизироваться прям с ходу куками
 */
application.auth()
  .then(() => {
    log.getLogger("main.js").info("cookie auth")
  },()=>{
    log.getLogger("main.js").info("cookie auth fails")
  })
  .then(() => {
/*    applicationView.propsData = {
      id: "a",
      model: application
    }
    applicationView.el = "#application"
    global.applicationView = new Vue(applicationView)*/

    global.view= new Vue({
      el: '#application',
      template:"<application id='a' :model='application'></application>",
      data:{
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

    if (application.user) {
      stateManager.popState(location.search.substring(1))
    } else {
      stateManager.popState(location.search.substring(1))
      // application.state = Application.State.Auth
    }

    if (0) {
      /**
       * временный автозаход
       */
      application.auth(config.unittest2.username, config.unittest2.password)
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
  })
