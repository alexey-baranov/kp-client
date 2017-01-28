/**
 * Created by alexey2baranov on 9/25/16.
 */

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandel rejection in promise. Reason: ' + JSON.stringify(reason), JSON.stringify(promise));
});

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import $ from "jquery"; global.$=$;
import log from "loglevel"
import Vue from 'vue'

import Application from './Application'
import applicationView from './view/application.vue'
let config = require("../cfg/main")[process.env.NODE_ENV]
let models = global.models = require("./model")
import StateManager from './StateManager'

// (async()=> {
  /**
   * прокачка логов
   */
  let originalFactory = log.methodFactory
  log.methodFactory = function (methodName, logLevel, loggerName) {
    let rawMethod = originalFactory(methodName, logLevel, loggerName);

    return function () {
      let originalArguments = arguments
      let newArguments = [/*new Date().toLocaleString(), */`[${methodName}]`, `${loggerName ? loggerName : "root"} - `,]

      for (let eachOriginalArgument of originalArguments) {
        newArguments.push(eachOriginalArgument)
      }

      rawMethod.apply(null, newArguments);
    };
  };
  log.setLevel(log.levels.TRACE); // Be sure to call setLevel method in order to apply plugin

  /**
   * инициализация application
   */
  let application = global.application = Application.getInstance()
  application.state = Application.State.Auth

  /**
   * временный автозаход
   */
  application.auth(config.unittest2.username, config.unittest2.password)
    .then(user=> {
      return user.dom.loaded()
    })
    .then(dom=>{
      application.setBody(dom)
      application.state= Application.State.Main
    })

// let applicationView= window.applicationView= new applicationView()
  applicationView.data = {
    id: "a",
    model: application
  }
  applicationView.el = "#application"

  global.applicationView = new Vue(applicationView)


/**
 * State management
 */
let stateManager= StateManager.getInstance()
stateManager.application= application
stateManager.applicationView= global.applicationView

stateManager.listen()
// })()
