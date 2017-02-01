/**
 * Created by alexey2baranov on 30.01.17.
 */

import Connection from '../Connection'
var RemoteModel = require("./RemoteModel")
let _ = require("lodash")

class Registration extends RemoteModel {
  constructor() {
    super()

    this.state= undefined
    this.email = undefined
    this.password = undefined
    this.password2 = undefined
    this.name = undefined
    this.surname = undefined
    this.patronymic = undefined
    this.birth = undefined
    this.passport = undefined

    this.dom = null
    this.verifier = null
    this.result = null


    /*
     включил в регистрацию чтобы пользоваться Registration.create()
     регистрацию нельзя создать без капчи поэтому она входит в модель
     хотя и не сохраняется в базе
     */
    this.captchaResponse = undefined
  }

  getPlain() {
    let result = {
      id: this.id,
      state: this.state,
      email: this.email,
      password: this.password,
      name: this.name,
      surname: this.surname,
      patronymic: this.patronymic,
      birth: this.birth,
      passport: this.passport,
      note: this.note,
      captchaResponse: this.captchaResponse,

      dom_id: this.dom ? this.dom.id : null,
      verifier_id: this.verifier ? this.verifier.id : null,
      result_id: this.result ? this.result.id : null,
    }
    return result
  }

  /**
   *  вливает новое состояние в объект и вызывает события
   */
  merge(json) {
    var prevState = {}
    Object.assign(prevState, this)

    this._isLoaded = true

    this.state= json.state
    this.email = json.email
    this.name = json.name
    this.surname = json.surname
    this.patronymic = json.patronymic
    this.birth = json.birth
    this.note = json.note

    this.dom = Zemla.getReference(json.dom_id)
    this.verifier = json.verifier_id?Kopnik.getReference(json.verifier_id):null
    this.result = json.result_id?Kopnik.getReference(json.result_id):null

    this.attachments = json.attachments ? json.attachments.map(EACH_ATTACHMENT => File.getReference(EACH_ATTACHMENT)) : undefined;

    if (this.state!= prevState.state || this.email != prevState.email || this.name != prevState.name || this.surname != prevState.surname ||
      this.patronymic != prevState.patronymic || this.birth != prevState.birth || this.note != prevState.note ||
      this.dom != prevState.dom || this.verifier != prevState.verifier || this.result != prevState.result ||
      _.difference(this.attachments, prevState.attachments).length) {

      this.emit(RemoteModel.event.change, this)
    }
  }

  async onPublication(args, kwargs, details) {
    await super.onPublication(args, kwargs, details)
  }

  isReady() {
    let result = this.email && this.password && this.password == this.password2 &&
      this.name && this.surname && this.patronymic && this.birth && this.passport &&
      this.dom &&
      this.captchaResponse

    return result
  }

  async getCountries(term) {
    let result = await Connection.getInstance().session.call("ru.kopa.Registration.getCountries", [], {term: term})
    this.log.debug("countries", result)
    return result
  }

  async getTowns(term, COUNTRY) {
    let result = await Connection.getInstance().session.call("ru.kopa.Registration.getTowns", [], {term, COUNTRY})
    this.log.debug("towns", result)
    return result
  }

  async getStreets(term, TOWN) {
    let result = await Connection.getInstance().session.call("ru.kopa.Registration.getStreets", [], {term, TOWN})
    this.log.debug("streets", result)
    return result
  }

  async getHouses(term, STREET) {
    let result = await Connection.getInstance().session.call("ru.kopa.Registration.getHouses", [], {term, STREET})
    this.log.debug("houses", result)
    return result
  }

  toString() {
    return `${this.constructor.name} {${this.id}, "${this.surname} ${this.name} ${this.patronymic}"}`;
  }
}

Registration.event = {}

module.exports = Registration

let Kopnik = require("./Kopnik");
let Zemla = require("./Zemla")
