/**
 * Created by alexey2baranov on 06.02.17.
 */
import Notification from './Notification'

import _ from "lodash"

export default class Grumbler {
  constructor() {
    this.log = require("loglevel").getLogger(this.constructor.name)
    this.errors = []
  }

  static getInstance() {
    if (!Grumbler.instance) {
      Grumbler.instance = new Grumbler()
    }
    return Grumbler.instance
  }

  static getErrorMessage(error) {
    let result
    if (error.message) {
      result = error.message
    }
    else if (error.args) {
      result = error.args[0]
    }
    return result
  }

  static getErrorStack(error) {
    let result
    if (error.message) {
      result = error.stack
    }
    else if (error.args) {
      result = error.kwargs.stack
    }
    return result
  }

  static getErrorType(error) {
    let result
    if (error.message) {
      result = error.constructor.name
    }
    else if (error.args) {
      result = error.error
    }
    return result
  }

  get currentErrorMessage() {
    if (!this.errors.length)
      return
    return Grumbler.getErrorMessage(this.errors[0])
  }

  get currentErrorStack() {
    if (!this.errors.length)
      return
    return Grumbler.getErrorStack(this.errors[0])
  }

  get currentErrorType() {
    if (!this.errors.length)
      return
    return Grumbler.getErrorType(this.errors[0])
  }

  /**
   * добавляет ошибку в стек ошибок
   * @param {Error | string} error
   *
   */
  pushError(error) {
    if (error.message && error.message.match(/Collapse is transitioning/)) {
      this.log.info(`skip bootstrap stupid "Collapse is transitioning" error`)
      return
    }
    this.log.error(error)
    if (_.isString(error)) {
      error = new Error(error)
    }
    let prevError = this.errors.find(each => each.tag && each.tag == error.tag)
    if (prevError) {
      this.errors.splice(this.errors.indexOf(prevError), 1)
    }
    this.errors.push(error)
  }

  /**
   * выбрасывает последнюю ошибку
   */
  shiftError() {
    this.errors.shift()
  }

  removeError(error) {
    let index
    if ((index = this.errors.indexOf(error)) != -1) {
      this.errors.splice(index, 1)
    }
  }

  addEventHandler() {
    let gOldOnError = window.onerror
    window.onerror = (errorMsg, url, lineNumber, error) => {
      this.log.debug("window.onerror() errorMsg", errorMsg, "url", url, "lineNumber", lineNumber, "error", error)
      if (gOldOnError) {
        gOldOnError(errorMsg, url, lineNumber, error)
      }
      this.pushError((error && error instanceof Error) ? error : new Error(errorMsg))
      return false
    }

    /**
     * асинхронные ошибки
     */
    window.addEventListener("unhandledrejection", (event) => {
      this.pushError(event.reason)
      // event.preventDefault()
    })
  }
}
