/**
 * Created by alexey2baranov on 30.01.17.
 */

import Connection from "./Connection"
import Kopnik from "./model/Kopnik"
let config = require("../cfg/main")[process.env.NODE_ENV]


export default class {
  constructor() {
    this.log = require("loglevel").getLogger("Registration")

    this.kopnik = new Kopnik()
    this.kopnik.address = {}
    this.id = undefined
    this.captchaResponse = undefined
    this.connection = null
  }

  isReady() {
    result = this.kopnik.email && this.kopnik.password && this.kopnik.password2 && this.kopnik.password == this.kopnik.password2 &&
      this.kopnik.name && this.kopnik.surname && this.kopnik.patronymic && this.kopnik.birth &&
      this.kopnik.address.house &&
      this.captchaResponse

    return result
  }

  connect(email, password) {
    return new Promise((res, rej) => {
      this.connection = new Connection({
        authid: config.unittest2.username,
        onchallenge: function (session, method, extra) {
          return config.unittest2.password
        }
      })

      this.connection.onopen = (session, details) => {
        session.prefix('api', 'ru.kopa')
        res(details)
      }

      this.connection.onclose = (reason, details) => {
        rej(details)
      }

      this.connection.open()
    })
  }

  disconnect(email, password) {
    return new Promise((res, rej) => {
      this.connection.onclose = (reason, details) => {
        res(details)
      }
      this.connection.close()
    })
  }

  async getCountries(term) {
    let result = await this.connection.session.call("ru.kopa.Registration.getCountries", [], {term: term})
    this.log.debug("countries", result)
    return result
  }

  async getTowns(term, COUNTRY) {
    let result = await this.connection.session.call("ru.kopa.Registration.getTowns", [], {term, COUNTRY});
    this.log.debug("towns", result)
    return result
  }

  async getStreets(term, TOWN) {
    let result = await this.connection.session.call("ru.kopa.Registration.getStreets", [], {term, TOWN});
    this.log.debug("streets", result)
    return result
  }

  async  getHouses(term, STREET) {
    let result = await this.connection.session.call("ru.kopa.Registration.getHouses", [], {term, STREET});
    this.log.debug("houses", result)
    return result
  }

  async send(){
    this.id = await this.connection.session.call("ru.kopa.Registration.apply", [], {kopnik: this.kopnik});
    this.log.debug("send result", result)

    return this.id
  }
}
