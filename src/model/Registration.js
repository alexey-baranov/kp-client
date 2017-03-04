/**
 * Created by alexey2baranov on 30.01.17.
 */

let Connection = require("../Connection").default
let RemoteModel = require("./RemoteModel")


// console.log("RemoteModel", RemoteModel)

let _ = require("lodash")

class Registration extends RemoteModel {
  constructor() {
    super()

    this.state = undefined
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
      attachments: this.attachments ? this.attachments.map(each => each.id).filter(each => each) : [],
    }
    return result
  }

  /**
   *  вливает новое состояние в объект и вызывает события
   */
  async merge(json) {
    var prevState = {}
    Object.assign(prevState, this)

    this._isLoaded = true

    this.state = json.state
    this.email = json.email
    this.name = json.name
    this.surname = json.surname
    this.patronymic = json.patronymic
    this.birth = json.birth
    this.passport = json.passport
    this.note = json.note

    this.dom = Zemla.getReference(json.dom_id)
    this.verifier = json.verifier_id ? Kopnik.getReference(json.verifier_id) : null
    this.result = json.result_id ? Kopnik.getReference(json.result_id) : null

    this.attachments = json.attachments.map(each => File.getReference(each.id))

    if (this.state != prevState.state || this.email != prevState.email || this.name != prevState.name || this.surname != prevState.surname ||
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
      (this.captchaResponse || this.dom.id < 100) //удобно для тестирования

    return result
  }

  async getCountries(term) {
    let result = await Connection.getAnonymousInstance().session.call("ru.kopa.registration.getCountries", [], {term: term})
    this.log.debug("countries", result)
    return result
  }

  async getTowns(term, COUNTRY) {
    let result = await Connection.getAnonymousInstance().session.call("ru.kopa.registration.getTowns", [], {
      term,
      COUNTRY
    })
    this.log.debug("towns", result)
    return result
  }

  async getStreets(term, TOWN) {
    let result = await Connection.getAnonymousInstance().session.call("ru.kopa.registration.getStreets", [], {
      term,
      TOWN
    })
    this.log.debug("streets", result)
    return result
  }

  async getHouses(term, STREET) {
    let result = await Connection.getAnonymousInstance().session.call("ru.kopa.registration.getHouses", [], {
      term,
      STREET
    })
    this.log.debug("houses", result)
    return result
  }

  toString() {
    return `${this.constructor.name} {${this.id}, "${this.surname} ${this.name} ${this.patronymic}"}`;
  }

  async fill() {
    this.email = "test@test.test"
    this.password = "1234"
    this.password2 = "1234"

    this.name = "test"
    this.surname = "test"
    this.patronymic = "test"
    this.birth = 1983
    this.passport = "1234"


    let country = Zemla.getReference(2)
    let town = (await this.getTowns("t", country.id))[0]
    let street = (await this.getStreets("s", town.id))[0]
    this.dom = (await this.getHouses("h", street.id))[0]
  }

  /**
   * Этот крит не создает объект в RemoteModel.cache
   * потому что этот объект не приввязан к событиям
   * и в случае его повтороного загружанания вернулась бы эта версия без событий что нехорошо
   * (хотя такое создание регистрации с последующим ее получением через get/getReference кроме тестов навряд ли еще где возможно)
   *
   * После создания регистрация не привязывается к своим событиям потому что
   * ананимусные конекшены невозможно отличить между собой и невозможно осмысленно предоставлять им права
   *
   * @param value
   * @return {Promise.<Registration>}
   */
  static async create(value) {
    if (!value.attachments) {
      value.attachments = [];
    }
    /**
     * если сюда передался id, то ниже он перекроет собой настоящий id
     */
    delete value.id
    delete value.created
    // let plain= this.getPlain(value);
    let plain = this.prototype.getPlain.call(value);
    // console.log(temp)
    let {id, created, verifier} = await Connection.getAnonymousInstance().session.call("api:model.create", [], {
      type: this.name,
      plain: plain
    });
    id = parseInt(id)
    created = new Date(created)

    let result = new Registration()
    result.id = id;
    Object.assign(result, value)
    result.created = created;
    result.verifier = new Kopnik()
    result.verifier.id = +verifier.id
    await result.verifier.merge(verifier)
    result._isLoaded = true

    // await result.subscribeToWAMPPublications();
    // console.log(result)
    return result;
  }
}

Registration.event = {}

module.exports = Registration

let File = require("./File")
let Kopnik = require("./Kopnik");
let Zemla = require("./Zemla")
