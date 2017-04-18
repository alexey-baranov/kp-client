/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
"use strict";

var DisplacingTimer = require("displacing-timer");
var RemoteModel = require("./RemoteModel");
let _ = require("lodash");
let Connection =require("../Connection").default

class Kopnik extends RemoteModel {
  constructor() {
    super();

    this.onlineTimer = new DisplacingTimer(this, this.onlineTimer_tick, Kopnik.OFFLINE_INTERVAL - 1500, DisplacingTimer.Type.Interval);

    this.email = undefined
    this.name = undefined
    this.surname = undefined
    this.patronymic = undefined
    this.birth = undefined
    this.passport= undefined
    this.isOnline = undefined

    this.dom = undefined
    this.starshina = undefined
    this.druzhina = undefined
    this.registrations = undefined

    this.voiskoSize = undefined
  }

  getPlain() {
    let result = {
      id: this.id,
      email: this.email,
      name: this.name,
      surname: this.surname,
      patronymic: this.patronymic,
      birth: this.birth,
      passport: this.passport,
      skype: this.skype,

      dom_id: this.dom ? this.dom.id : null,
      starshina_id: this.starshina ? this.starshina.id : null,
      note: this.note,
      druzhina: this.druzhina ? this.druzhina.map(eachDruzhe => eachDruzhe.getPlain()) : undefined,
      attachments: this.attachments ? this.attachments.map(each => each.id).filter(each=>each) : []
    }
    return result
  }

  /**
   *  вливает новое состояние в объект и вызывает события
   */
  async merge(json) {
    var prevState = {};
    Object.assign(prevState, this);

    this._isLoaded = true;

    this.email = json.email;
    this.name = json.name;
    this.surname = json.surname;
    this.patronymic = json.patronymic;
    this.birth = json.birth;
    this.passport = json.passport
    this.skype= json.skype
    this.isOnline = json.isOnline;
    this.note = json.note;
    this.voiskoSize = json.voiskoSize;

    this.dom = Zemla.getReference(json.dom_id);
    this.starshina = json.starshina_id ? Kopnik.getReference(json.starshina_id) : null;
    this.attachments = json.attachments?json.attachments.map(each => File.getReference(each.id)):[]
    /*      это асинхронная штукенция поэтому непонятно как ее тут выполнять даже
     if (json.druzhina) {
     this.druzhina= json.druzhina.map(eachDruzheAsPlain=>{
     let eachDruzhe= new Kopnik();
     eachDruzhe.merge(eachDruzheAsPlain);
     eachDruzhe.subscribeToWAMPPublications();
     });
     }*/

    if (this.email != prevState.email || this.name != prevState.name || this.surname != prevState.surname ||
      this.patronymic != prevState.patronymic || this.birth != prevState.birth || this.passport != prevState.passport ||
      this.skype != prevState.skype || this.note != prevState.note ||
      this.dom != prevState.dom ||
      _.difference(this.attachments, prevState.attachments).length) {

      this.emit(RemoteModel.event.change, this)
    }
  }

  async onPublication(args, kwargs, details) {
    await super.onPublication(args, kwargs, details);
    if (details.topic.match(/\.voiskoChange$/)) {
      this.voiskoSize = kwargs.voiskoSize;
      this.emit(Kopnik.event.voiskoChange, this);
    }
    else if (details.topic.match(/\.starshinaChange$/)) {
      if (kwargs.KOPNIK == this.id) {
        this.starshina = kwargs.STARSHINA ? Kopnik.getReference(kwargs.STARSHINA) : null;
      }
      this.emit(Kopnik.event.starshinaChange, this, kwargs);
    }
    else if (details.topic.match(/\.druzhinaChange$/) && this.druzhina) {
      switch (kwargs.action) {
        case "add":
          var kopnik = await Kopnik.get(kwargs.kopnik);
          this.druzhina.push(kopnik);
          break;
        case "remove":
          this.druzhina = this.druzhina.filter(eachDruzhe => eachDruzhe.id != kwargs.KOPNIK);
          break;
      }
      this.emit(Kopnik.event.druzhinaChange, this);
    }
    else if (details.topic.match(/\.registrationAdd$/)) {
      if (!this.registrations) {
        this.log.debug("список регистраций еще не загружен");
      }
      else {
        let REGISTRATION = args[0];
        let registration = await Registration.get(REGISTRATION);
        this.registrations.push(registration);
        this.emit(Kopnik.event.registrationAdd, this, registration);
      }
    }
  }

  async getStarshinaNaZemle(zemla){
    let starshini= await this.getStarshini()

    starshini.reverse()

    for(let eachStarshina of starshini){
      for (let eachStarshinaEachDom of await eachStarshina.getDoma()){
        if (eachStarshinaEachDom== zemla){
          return eachStarshina
        }
      }
    }

    return null
  }
  async getStarshinaNaKope(kopa){
    await kopa.joinedLoaded()
    return await this.getStarshinaNaZemle(kopa.place)
  }

  /**
   * Все дома, начиная от непосредственного
   *
   * @return {Promise.<[*]>}
   */
  async getDoma(){
    let result= [await this.dom.joinedLoaded()]
    result= result.concat(await this.dom.getParents())

    return result
  }

  /**
   * Всех старшин, начиная от непосредственного
   *
   * @return {Promise.<Array>}
   */
  async getStarshini(){
    let result= []
    for (let eachStarshina = this.starshina; eachStarshina; eachStarshina = eachStarshina.starshina) {
      await eachStarshina.joinedLoaded()
      result.push(eachStarshina)
    }
    return result
  }

  async setStarshina(value) {
    await Connection.getInstance().session.call("api:model.Kopnik.setStarshina", null, {
      KOPNIK: this.id,
      STARSHINA: value ? value.id : null
    }, {disclose_me: true})
    // this.starshina = value;
    this.emit(Kopnik.event.starshinaChange, this);
  }

  /**
   * вызывается только в случае если уже не была загружена ранее
   * @return {*}
   */
  async loadDruzhina() {
    if (!this.druzhina) {
      let resultAsPlain = await Connection.getInstance().session.call("api:model.Kopnik.getDruzhina", null, {
        KOPNIK: this.id,
      }, {disclose_me: true});

      let result = await Promise.all(resultAsPlain.map(async eachResultAsPlain => await Kopnik.get(eachResultAsPlain)))

      this.druzhina = result;
      this.emit(Kopnik.event.druzhinaLoad, this);
    }
    return this.result;
  }

  /**
   * 1 - ЗА
   * 0 - воздержался
   * -1  ПРОТИВ
   * @param subject
   * @param value
   * @return {Promise.<*>}
   */
  async vote(subject, value) {
    let result = await Connection.getInstance().session.call("api:model.Kopnik.vote", null, {
      KOPNIK: this.id,
      SUBJECT: subject.id,
      value: value
    }, {disclose_me: true});
    return result;
  }

  async verifyRegistration(subject, state) {
    let result = await Connection.getInstance().session.call("api:model.Kopnik.verifyRegistration", null, {
      SUBJECT: subject.id,
      state
    }, {disclose_me: true})
    return result
  }

  /**
   * перегружает регистрации которые ему поручены
   * @return {Promise.<void>}
   */
  async reloadRegistrations() {
    let registrationsAsPlain = await Connection.getInstance().session.call("ru.kopa.model.Kopnik.getRegistrations", [], {}, {disclose_me: true});

    this.registrations = await Promise.all(registrationsAsPlain.map(async eachRegistrationAsPlain => await Registration.get(eachRegistrationAsPlain)))

    this.emit(Kopnik.event.registrationsReload, this);
  }

  updateLastActiveTime() {

  }

  onlineTimer_tick() {
    this.updateLastActiveTime();
  }

  beOnline() {
    this.onlineTimer.start();
    return this.updateLastActiveTime();
  }

  /**
   * для унификации обхода иерархических структур
   * у всех иерархий должен быть parent
   */
  get parent() {
    return this.starshina
  }

  get fullName(){
    return `${this.surname} ${this.name} ${this.patronymic}`
  }

  toString() {
    return `${this.constructor.name} {${this.id}, "${this.surname} ${this.name}"}`;
  }

  static async getByEmail(email) {
    let RESULT = await Connection.getInstance().session.call("ru.kopa.model.getKOPNIKByEmail", [], {email: email});
    let result = await this.get(RESULT)

    return result
  }
}


Kopnik.Status = {
  Offline: -1,
  Online: 1
};

Kopnik.OFFLINE_INTERVAL = 5000;

Kopnik.event = {
  voiskoChange: "voiskoChange",
  starshinaChange: "starshinaChange",
  druzhinaChange: "druzhinaChange",
  druzhinaLoad: "druzhinaLoad",
  registrationAdd: "registrationAdd",
  registrationsReload: "registrationsReload"
};

module.exports = Kopnik


let File= require("./File")
let Registration = require("./Registration")
let Zemla = require("./Zemla");
