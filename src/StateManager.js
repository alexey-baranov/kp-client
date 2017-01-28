/**
 * Created by alexey2baranov on 28.01.17.
 */
import $ from "jquery"

export default class StateManager {
  constructor(application, applicationView) {
    this.log = require("loglevel").getLogger(this.constructor.name)
    this.application = application
    this.applicationView = applicationView
  }

  static getInstance() {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager()
    }
    return StateManager.instance
  }

  getState(){
    let result= {
      a: this.application.getState(),
      v: this.applicationView.getState()
    }

    this.log.debug(result)

    return result
  }


  getUrl(state) {
    const result = "/?"+decodeURIComponent($.param(state))
    this.log.debug("url", result)

    return result
  }

  pushState() {
    history.pushState(null, Application.getInstance().title, this.getUrl(this.getState()))
  }

  replaceState() {
    history.replaceState(null, Application.getInstance().title, this.getUrl(this.getState()))
  }

  popState(state) {
    this.application.setState(state.a)
    this.applicationView.setState(state.v)
  }

  listen() {
    window.onpopstate =  (event) =>{
      let search = location.search.substring(1);
      let state = search ? JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g, '":"') + '"}', function (key, value) {
          return key === "" ? value : decodeURIComponent(value)
        }) : {}
      this.log.debug("parsed state", state)
      this.popState(state)
    }
  }
}

import Application from './Application'
