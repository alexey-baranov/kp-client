/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
"use strict";

var RemoteModel = require("./RemoteModel");
import Connection from "../Connection"
let _ = require("lodash");
import join from "../decorator/join"

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

    /**
     * Этот флаг выставвляется когда загружена самая первая копа и нет необходимости
     * запускать подзагрузку предыдущех партий коп
     * @type {boolean}
     */
    this.areAllKopiLoaded= false

    /**
     * Это поле нужно исключительно для нужд zemla.vue
     * и входящей в нее kopa-as-list-item.vue
     * @type {Kopa}
     */
    this.newKopa= null
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


  async loadKopi(count=25) {
    let BEFORE
    if (this.kopi && this.kopi.length){
      BEFORE= this.kopi[0].invited?this.kopi[0].invited.getTime():Date.getTime()+3600*1000 //запас на неправильное время на телефоне пользователя
    }

    let loadedKopiAsPlain = await Connection.getInstance().session.call("ru.kopa.model.Zemla.promiseKopi", [], {
      PLACE: this.id,
      BEFORE,
      count
    }, {disclose_me: true})

    let loadedKopi= await Promise.all(loadedKopiAsPlain.map(async eachKopaAsPlain => {
      let eachKopa = Kopa.get(eachKopaAsPlain)
      return eachKopa;
    }))

    if (!this.kopi){
      this.kopi= loadedKopi
    }
    else{
      this.kopi = loadedKopi.concat(this.kopi)
    }

    if (loadedKopi.length<count){
      this.areAllKopiLoaded=true
    }

/*    await new Promise((res)=>{
      setTimeout(res, 2000)
    })*/

    // console.log(this.kopi.map(eachKopa=>eachKopa.id))

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
