/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template Golos, choose Tools | Templates
 * and open the template in the editor.
 */
"use strict";

var RemoteModel = require("./RemoteModel");
let _ = require("lodash");
let Connection = require("../Connection").default

class Predlozhenie extends RemoteModel {
  constructor() {
    super();

    this.value = undefined;
    this.place = undefined;
    this.owner = undefined;
    this.state = null;
    this.golosa = undefined; //массив ПРЯМЫХ голосов, голоса дружины здесь не числятся потому что этот массив будет раздут до нескольких миллионов элементов
    this.totalZa = 0
    this.totalProtiv = 0
  }

  getPlain() {
    let result = {
      id: this.id,
      value: this.value,
      state: this.state,
      place_id: this.place ? this.place.id : null,
      owner_id: this.owner ? this.owner.id : null,
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

    if (json.hasOwnProperty("value")) {
      this.value = json.value;
    }
    if (json.hasOwnProperty("state")) {
      this.state = json.state;
    }
    if (json.hasOwnProperty("note")) {
      this.note = json.note;
    }
    if (json.hasOwnProperty("attachments")) {
      this.attachments = json.attachments.map(each => File.getReference(each.id))
    }
    if (json.hasOwnProperty("owner_id")) {
      this.owner = Kopnik.getReference(json.owner_id);
    }
    if (json.hasOwnProperty("place_id")) {
      this.place = Kopa.getReference(json.place_id);
    }
    this.created = new Date(json.created_at);
    this.totalZa = json.totalZa;
    this.totalProtiv = json.totalProtiv;

    if (json.hasOwnProperty("value") && this.value != prevState.value ||
      json.hasOwnProperty("state") && this.state != prevState.state ||
      json.hasOwnProperty("note") && this.note != prevState.note ||
      this.totalZa != prevState.totalZa ||
      this.totalProtiv != prevState.totalProtiv ||
      this.owner != prevState.owner ||
      json.hasOwnProperty("place_id") && this.place != prevState.place ||
      json.hasOwnProperty("attachments") && _.difference(this.attachments, prevState.attachments).length) {

      this.emit(RemoteModel.event.change, this);
    }
  }

  async onPublication(args, kwargs, details) {
    await super.onPublication(args, kwargs, details);
    if (details.topic.match(/\.rebalance$/)) {
      this.state = kwargs.state
      if (this.golosa) {
        this.totalZa = kwargs.totalZa;
        this.totalProtiv = kwargs.totalProtiv;
        if (kwargs.delta) {
          for (let eachDelta of kwargs.delta) {
            let golos;
            switch (eachDelta.action) {
              case "add":
                golos = await Golos.get(eachDelta.GOLOS)
                this.golosa.push(golos)
                break;
              case "remove":
                this.golosa = this.golosa.filter(eachGolos => eachGolos.id != eachDelta.GOLOS)
                break;
              case "update":
                golos = this.golosa.find(eachGolos => eachGolos.id = eachDelta.GOLOS)
                if (golos) {
                  golos.value = eachDelta.value
                }
                break
            }
          }
        }
        this.emit(Predlozhenie.event.rebalance, this, kwargs);
      }
    }
  }

  /**
   * загружает прямые голоса
   */
  async reloadGolosa() {
    let golosaAsPlain = await Connection.getInstance().session.call("api:model.Predlozhenie.getGolosa", [], {
      PREDLOZHENIE: this.id
    }, {disclose_me: true});

    let golosa = await Promise.all(golosaAsPlain.map(async eachGolosAsPlain => await Golos.get(eachGolosAsPlain)));

    this.golosa = golosa;
    this.emit(Predlozhenie.event.golosaReload, this);

    return this.golosa;
  }

  get za() {
    if (!this.golosa) {
      return undefined;
    }
    return this.golosa.filter(eachGolos => eachGolos.value == 1);
  }

  get protiv() {
    if (!this.golosa) {
      return undefined;
    }
    return this.golosa.filter(eachGolos => eachGolos.value == -1);
  }

  toString() {
    return `${this.constructor.name} {${this.id}, "${this.value.substr(0, 10)}"}`;
  }
}

Predlozhenie.event = {
  golosaReload: "golosaReload",
  /*
   * golosAdd неправильное название потому что ребаланс может произойти не только в результате нового голоса,
   * но и в результате передумал и проголосовал по другому и в результате передумал и решил вообще не голосоваться
   * общее название для всех этих событий ребаланс
   * golosAdd: "golosAdd",
   */

  /**
   * kwargs {
     *  totalZa,
     *  totalProtiv,
     *  ADD?,
     *  REMOVE?
     * }
   */
  rebalance: "rebalance",
};

module.exports = Predlozhenie;

let File = require("./File")
let Golos = require("./Golos");
let Kopa = require("./Kopa");
let Kopnik = require("./Kopnik");
