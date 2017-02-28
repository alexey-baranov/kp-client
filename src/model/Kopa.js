/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template Golos, choose Tools | Templates
 * and open the template in the editor.
 */
"use strict";

var RemoteModel = require("./RemoteModel");
let Connection = require("../Connection").default
let _ = require("lodash");

class Kopa extends RemoteModel {
  constructor() {
    super();

    this.place = undefined;
    this.owner = undefined;
    this.question = undefined;
    this.invited = undefined;
    this.dialog = undefined;
    this.result = undefined;

    /**
     * Это поле нужно исключительно для нужд kopa.vue
     * и входящей в нее predlozhenie-as-list-item.vue
     * @type {Kopa}
     */
    this.newResult = null

    /**
     * Это поле нужно исключительно для нужд kopa.vue
     * и входящей в нее slovo-as-list-item.vue
     * @type {Kopa}
     */
    this.newSlovo = null
  }

  getPlain() {

    let result = {
      id: this.id,
      place_id: this.place ? this.place.id : null,
      owner_id: this.owner ? this.owner.id : null,
      question: this.question,
      invited: this.invited,
      note: this.note,
      attachments: this.attachments ? this.attachments.map(each => each.id).filter(each => each) : []
    };
    return result;
  }

  /**
   *  вливает новое состояние в объект и вызывает события
   */
  async merge(json) {
    var prevState = {};
    Object.assign(prevState, this);

    this._isLoaded = true;

    if (json.created) {
      this.created = new Date(json.created)
    }
    if (json.hasOwnProperty("question")) {
      this.question = json.question;
    }
    if (json.hasOwnProperty("invited")) {
      this.invited = json.invited ? new Date(json.invited) : null
    }
    if (json.hasOwnProperty("note")) {
      this.note = json.note;
    }
    if (json.hasOwnProperty("attachments")) {
      this.attachments = json.attachments.map(each => File.getReference(each.id))
    }
    if (json.hasOwnProperty("owner_id")) {
      this.owner = Kopnik.getReference(json.owner_id)
    }
    if (json.hasOwnProperty("place_id")) {
      this.place = Zemla.getReference(json.place_id);
    }

    if (json.hasOwnProperty("question") && this.question != prevState.question ||
      json.hasOwnProperty("invited") && this.invited != prevState.invited ||
      json.hasOwnProperty("note") && this.note != prevState.note ||
      json.hasOwnProperty("attachments") && _.difference(this.attachments, prevState.attachments).length) {

      this.emit(RemoteModel.event.change, this);
    }
  }


  async onPublication(args, kwargs, details) {
    await super.onPublication(args, kwargs, details);
    if (details.topic.match(/\.slovoAdd$/)) {
      if (this.dialog) {
        let slovo = await Slovo.get(args[0]);
        this.dialog.push(slovo);
        this.emit(Kopa.event.slovoAdd, this, slovo);
      }
    }
    else if (details.topic.match(/\.predlozhenieAdd$/)) {
      if (this.result) {
        let predlozhenie = await Predlozhenie.get(args[0]);
        this.result.push(predlozhenie);
        this.emit(Kopa.event.predlozhenieAdd, this, predlozhenie);
      }
    }
    else if (details.topic.match(/\.predlozhenieDestroy$/)) {
      if (this.result) {
        let destroyed = this.result.find(eachResult => eachResult.id == args[0])

        let index = this.result.indexOf(destroyed)
        if (index != -1) {
          this.result.splice(index, 1)
        }

        this.emit(Kopa.event.predlozhenieDestroy, this, destroyed);
      }
    }
    else if (details.topic.match(/\.slovoDestroy$/)) {
      if (this.dialog) {
        let destroyed = this.dialog.find(e => e.id == args[0])

        let index = this.dialog.indexOf(destroyed)
        if (index != -1) {
          this.dialog.splice(index, 1)
        }

        this.emit(Kopa.event.slovoDestroy, this, destroyed);
      }
    }
  }

  async invite(value) {
    await Connection.getInstance().session.call("api:model.Kopa.invite", null, {id: this.id}, {disclose_me: true});
  }

  /**
   * подгружает диалог
   * или предыдущую порцию, если он уже начат загружаться
   */
  async loadDialog() {
    let dialogAsPlain = await Connection.getInstance().session.call("api:model.Kopa.getDialog", [this.id], null, {disclose_me: true})

    let dialog = await Promise.all(dialogAsPlain.map(async eachSlovoAsPlain => Slovo.get(eachSlovoAsPlain)))
    this.dialog = dialog
    this.emit(Kopa.event.dialogLoad, this)

    return this.dialog;
  }

  /**
   * подгружает результат
   * или предыдущую порцию, если он уже начат загружаться
   */
  async loadResult() {
    let resultAsPlain = await Connection.getInstance().session.call("api:model.Kopa.getResult", [this.id], null, {disclose_me: true})

    let result = await Promise.all(resultAsPlain.map(async eachResultAsPlain => Predlozhenie.get(eachResultAsPlain)))
    this.result = result
    this.emit(Kopa.event.resultLoad, this)
    return this.result;
  }

  get name() {
    return this.question ? this.question.substring(0, 50) : undefined
  }

  toString() {
    return `${this.constructor.name} {${this.id}, "${this.name}"}`;
  }
}

Kopa.event = {
  slovoAdd: "slovoAdd",
  predlozhenieAdd: "predlozhenieAdd",
  predlozhenieDestroy: "predlozhenieDestroy",
  slovoDestroy: "slovoDestroy",
  dialogLoad: "dialogLoad",
  resultLoad: "resultLoad",
};

module.exports = Kopa;

let File = require("./File")
let Kopnik = require("./Kopnik")
let Slovo = require("./Slovo")
let Zemla = require("./Zemla")
let Predlozhenie = require("./Predlozhenie")
