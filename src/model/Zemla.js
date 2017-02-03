/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
"use strict";

var RemoteModel = require("./RemoteModel");
import Connection from "../Connection"
let _ = require("lodash");

class Zemla extends RemoteModel {
  constructor() {
    super();

    this.name = undefined;

    // разрешенное количество собираемых коп в 1 год
    this.intensity = undefined;
    this.obshinaSize = undefined;
    this.kopi = undefined;
    this.parent = undefined;
    this.children = undefined;
    this.obshina = undefined;
  }

  /**
   * Плоское представление объекта по правилам секвилизы
   * для передачина в Server#model_save()
   * @param value
   */
  getPlain() {
    let result = {
      id: this.id,
      name: this.name,
      intensity: this.intensity,
      parent_id: this.parent ? this.parent.id : null,
      note: this.note,
      attachments: this.attachments ? this.attachments.map(each => each.id) : []
    };
    return result;
  }

  async onPublication(args, kwargs, details) {
    await super.onPublication(args, kwargs, details);
    if (details.topic.match(/\.kopaAdd$/)) {
      if (!this.kopi) {
        this.log.debug("список коп еще не загружен");
      }
      else {
        let KOPA = args[0];
        let kopa = this.kopi.find(eachKopa => eachKopa.id == KOPA);

        //созвана копа, которая уже в списке
        if (kopa) {
          this.log.debug("созвана копа, которая уже в списке");
        }
        //чужая копа, которой нет в списке
        else {
          kopa = await Kopa.get(KOPA);
          this.kopi.push(kopa);
        }
        this.emit(Zemla.event.kopaAdd, this, kopa);
      }
    }
    else if (details.topic.match(/\.obshinaChange$/)) {
      this.obshinaSize = kwargs.obshinaSize;
      this.emit(Zemla.event.obshinaChange, this);

      if (this.children) {
        throw new Error("дочки устарели");
      }
    }

  }


  /**
   *  вливает новое состояние в объект и вызывает события
   */
  merge(json) {
    var prevState = {};
    Object.assign(prevState, this);

    this._isLoaded = true;

    this.name = json.name;
    this.intensity = json.intensity;
    this.obshinaSize = json.obshinaSize;
    if (json.parent_id) {
      this.parent = Zemla.getReference(json.parent_id);
    }
    else {
      this.parent = null;
    }
    this.note = json.note;
    this.attachments = json.attachments.map(EACH_ATTACHMENT => File.getReference(EACH_ATTACHMENT));

    if (this.name != prevState.name ||
      this.intensity != prevState.intensity ||
      this.obshinaSize != prevState.obshinaSize ||
      this.note != prevState.note ||
      _.difference(this.attachments, prevState.attachments).length) {

      this.emit(RemoteModel.event.change, this);
    }
  }

  async setParent(value) {
    await Connection.getInstance().session.call("ru.kopa.model.Zemla.setParent", [], {
      ZEMLA: this.id,
      PARENT: value ? value.id : null
    }, {disclose_me: true});
    this.emit(Zemla.event.parentChange, this);
  }

  async reloadKopi() {
    let kopiAsPlain = await Connection.getInstance().session.call("ru.kopa.model.Zemla.promiseKopi", [], {
      PLACE: this.id,
      BEFORE: null
    }, {disclose_me: true});

    this.kopi = await Promise.all(kopiAsPlain.map(async eachKopaAsPlain => {
      let eachKopa = Kopa.getReference(eachKopaAsPlain.id);
      eachKopa.merge(eachKopaAsPlain);
      await eachKopa.subscribeToWAMPPublications();
      return eachKopa;
    }));

    this.emit(Zemla.event.kopiReload, this);
  }
}

Zemla.event = {
  kopiReload: "kopiReload",
  kopaAdd: "kopaAdd",
  parentChange: "parentChange",
};

module.exports = Zemla;

let Kopa = require("./Kopa");
