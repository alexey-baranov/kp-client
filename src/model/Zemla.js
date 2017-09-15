/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
"use strict";

var RemoteModel = require("./RemoteModel");
let Connection = require("../Connection").default
let _ = require("lodash");
let join = require("../decorator/join").default

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
    this.scrollItem = null


    /**
     * Этот флаг выставвляется когда загружена самая первая копа и нет необходимости
     * запускать подзагрузку предыдущех партий коп
     * @type {boolean}
     */
    this.areAllKopiLoaded = false

    /**
     * самая первая копа на земле, перед которым не надо уже загружать предыдущие копы
     * null - если первой копы еще нет. не путать с undefined - не известно какое оно
     * @type {null}
     */
    this.firstKopa = undefined

    /**
     * Это поле нужно исключительно для нужд zemla.vue
     * и входящей в нее kopa-as-list-item.vue
     * @type {Kopa}
     */
    this.newKopa = null

    this.joinedLoadKopi = join(this.loadKopi)
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
      attachments: this.attachments ? this.attachments.map(each => each.id).filter(each => each) : []
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
          kopa.once(RemoteModel.event.destroy, this.kopa_destroy.bind(this))
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
  async merge(json) {
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
    this.attachments = json.attachments.map(each => File.getReference(each.id))

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

  /**
   * всех предков начиная от родителя
   * @return {Promise.<void>}
   */
  async getParents() {
    let result = []
    for (let eachParent = this.parent; eachParent; eachParent = eachParent.parent) {
      result.push(eachParent)
      await eachParent.joinedLoaded()
    }

    return result
  }

  kopa_destroy(kopa) {
    let index = this.kopi.indexOf(kopa)
    if (index != -1) {
      this.kopi.splice(index, 1)
    }
    this.emit(Zemla.event.kopaDestroy, this, kopa)
  }

  async loadKopi(count = Zemla.loadPrevSize, until = null) {
    let BEFORE
    if (this.kopi && this.kopi.length) {
      BEFORE = this.kopi[0] ? this.kopi[0].id : null //запас на неправильное время на телефоне пользователя
    }

    let loadedKopiAsPlain = await Connection.getInstance().session.call("ru.kopa.model.Zemla.promiseKopi", [], {
      PLACE: this.id,
      BEFORE,
      count: count || Zemla.loadPrevSize,
      UNTIL: until ? until.id : null,
    }, {disclose_me: true})

    this.log.debug(loadedKopiAsPlain)

    let loadedKopi = await Promise.all(loadedKopiAsPlain.map(async eachKopaAsPlain => {
      let eachKopa = await Kopa.get(eachKopaAsPlain)
      eachKopa.once(RemoteModel.event.destroy, this.kopa_destroy.bind(this))
      return eachKopa
    }))


    /*
     eachKopa.on(Kopa.event.slovoAdd, (slovo)=>{
     this.emit(Kopa.event.slovoAdd, slovo)
     })
     eachKopa.on(Kopa.event.predlozhenieAdd, (predlozhenie)=>{
     this.emit(Kopa.event.slovoAdd, predlozhenie)
     })
     */
    if (!this.kopi) {
      this.kopi = loadedKopi
    }
    else {
      this.kopi = loadedKopi.concat(this.kopi)
    }

    if (loadedKopi.length < count) {
      this.areAllKopiLoaded = true
      this.firstKopa = this.kopi.length ? this.kopi[0] : null
    }

    /*    await new Promise((res)=>{
     setTimeout(res, 2000)
     })*/

    // console.log(this.kopi.map(eachKopa=>eachKopa.id))

    this.emit(Zemla.event.kopiReload, this);
    return this.kopi
  }
}
Zemla.loadPrevSize = 50
Zemla.event = {
  kopiReload: "kopiReload",
  kopaAdd: "kopaAdd",
  kopaDestroy: "kopaDestroy",
  parentChange: "parentChange",
};

module.exports = Zemla;

let File = require("./File")
let Kopa = require("./Kopa")
