/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template Golos, choose Tools | Templates
 * and open the template in the editor.
 */
"use strict";

var RemoteModel = require("./RemoteModel");
let _ = require("lodash");


class Golos extends RemoteModel {
  constructor() {
    super();

    this.value = undefined;
    this.owner = undefined;
    this.subject = undefined;
  }

  getPlain() {

    let result = {
      id: this.id,
      value: this.value,
      owner_id: this.owner ? this.owner.id : null,
      subject_id: this.subject ? this.subject.id : null,
      note: this.note,
      attachments: this.attachments ? this.attachments.map(each => each.id).filter(each=>each) : []
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

    if (json.hasOwnProperty("value")) {
      this.value = json.value;
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
    if (json.hasOwnProperty("subject_id")) {
      this.subject = Predlozhenie.getReference(json.subject_id)
    }
    this.created = new Date(json.created_at)

    if (json.hasOwnProperty("value") && this.value != prevState.value ||
      json.hasOwnProperty("note") && this.note != prevState.note ||
      this.owner != prevState.owner ||
      json.hasOwnProperty("subject_id") && this.subject != prevState.subject ||
      json.hasOwnProperty("attachments") && _.difference(this.attachments, prevState.attachments).length) {

      this.emit(RemoteModel.event.change, this);
    }
  }

  toString() {
    return `${this.constructor.name} {${this.id}, ${this.value}}`;
  }
}

module.exports = Golos;

let File= require("./File")
let Kopnik = require("./Kopnik")
let Predlozhenie = require("./Predlozhenie")
