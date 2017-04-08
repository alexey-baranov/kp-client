/**
 * Created by alexey2baranov on 28.01.17.
 */
import $ from "jquery"
import deparam from "deparam"

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

  getState() {
    let result = this.application.getState()
    result.v = this.applicationView.getState()

    return result
  }


  param(state) {
    const result = "?" + decodeURIComponent($.param(state))
    this.log.debug("url", result)

    return result
  }

  pushState() {
    let state = this.getState()
    this.log.debug("pushState", state)
    history.pushState(null, Application.getInstance().title, this.param(state))
    return state
  }

  replaceState() {
    let state = this.getState()
    this.log.debug("replaceState", state)
    history.replaceState(null, Application.getInstance().title, this.param(state))
    return state
  }

  /**
   * По урлу или объекту параметров
   * @param state
   */
  async popState(state) {
    if (typeof state == "string") {
      state = state ? deparam(state) : {}
    }
    this.log.debug("popState", state)

    let stop = this.application.setState(state)

    if (!stop) {
      // await Promise.resolve()
      setImmediate(()=>{
        this.applicationView.setState(state.v)
      })
    }
  }

  /**
   * Состояние воспроизводится только по query
   * потому что если передать ссылку по месенджеру,
   * то никаких state и title не будет
   */
  listen() {
    window.onpopstate = (event) => {
      let query = location.search.substring(1)
      this.popState(query)
    }
  }
}

import Application from './Application'
