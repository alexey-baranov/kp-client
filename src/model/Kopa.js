/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template Golos, choose Tools | Templates
 * and open the template in the editor.
 */
"use strict";

let join = require("../decorator/join").default
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
    this.scrollItem = null

    /**
     * самое первое слово на копе, перед которым не надо уже загружать предыдущие слова
     * null - если первого слова еще нет. не путать с undefined - не известно какое оно
     * @type {null}
     */
    this.firstSlovo = undefined

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

    this.joinedLoadResult = join(this.loadResult)
    this.joinedLoadDialog = join(this.loadDialog)
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

    if (json.created_at) {
      this.created = new Date(json.created_at)
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

  result_destroy(result) {
    let index = this.result.indexOf(result)
    if (index != -1) {
      this.result.splice(index, 1)
    }
    this.emit(Kopa.event.predlozhenieDestroy, this, result)
  }

  async onPublication(args, kwargs, details) {
    await super.onPublication(args, kwargs, details);
    if (details.topic.match(/\.slovoAdd$/)) {
      if (this.dialog) {
        let slovo = await Slovo.get(args[0]);
        this.dialog.push(slovo)
        slovo.once(RemoteModel.event.destroy, () => {
          let index = this.dialog.indexOf(slovo)
          if (index != -1) {
            this.dialog.splice(index, 1)
          }
          this.emit(Kopa.event.slovoDestroy, this, slovo)
        })
        this.emit(Kopa.event.slovoAdd, this, slovo)
      }
    }
    else if (details.topic.match(/\.predlozhenieAdd$/)) {
      if (this.result) {
        let predlozhenie = await Predlozhenie.get(args[0]);
        this.result.push(predlozhenie);
        predlozhenie.once(RemoteModel.event.destroy, this.result_destroy.bind(this))
        this.emit(Kopa.event.predlozhenieAdd, this, predlozhenie);
      }
    }
  }

  async destroy(soft = false) {
    if (soft) {
      let childs = [].concat(this.dialog, this.result).filter(eachChild => eachChild)
      for (let eachChild of childs) {
        await eachChild.destroy(true)
      }
    }
    await super.destroy(soft)
  }

  async invite(value) {
    await Connection.getInstance().session.call("api:model.Kopa.invite", null, {id: this.id}, {disclose_me: true});
  }

  /**
   * подгружает очередную порцию диалога
   * предыдущий - это теперь id
   * потому что если по created, то два слова внутри одной секунды создались - они одну таймстампу имеют и не разлечимы
   * и тогда тот который на долю секунды раньше создался, не попадет в диалог
   *
   */
  async loadDialog(count = Kopa.loadPrevSize, until = null) {
    let BEFORE
    if (this.dialog && this.dialog.length) {
      BEFORE = this.dialog[0].id
    }


    let loadedDialogAsPlain = await Connection.getInstance().session.call("ru.kopa.model.Kopa.getDialog", [], {
      PLACE: this.id,
      BEFORE,
      UNTIL: until ? until.id : null,
      count: count || Kopa.loadPrevSize,
    }, {disclose_me: true})

    let loadedDialog = await Promise.all(loadedDialogAsPlain.map(async eachSlovoAsPlain => Slovo.get(eachSlovoAsPlain)))

    if (!this.dialog) {
      this.dialog = loadedDialog
    }
    else {
      this.dialog = loadedDialog.concat(this.dialog)
    }

    if (loadedDialog.length < count) {
      this.firstSlovo = this.dialog.length ? this.dialog[0] : null
    }

    this.emit(Kopa.event.dialogLoad, this)
    return this.dialog
  }

  /**
   * подгружает результат
   * или предыдущую порцию, если он уже начат загружаться
   */
  async loadResult() {
    let resultAsPlain = await Connection.getInstance().session.call("api:model.Kopa.getResult", [this.id], null, {disclose_me: true})

    let result = await Promise.all(resultAsPlain.map(async eachResultAsPlain => {
      let eachResult= await Predlozhenie.get(eachResultAsPlain)
      eachResult.once(RemoteModel.event.destroy, this.result_destroy.bind(this))
      return eachResult
    }))
    this.result = result
    this.emit(Kopa.event.resultLoad, this)
    return this.result;
  }

  get name() {
    return this.question ? this.question.substring(0, 25) : undefined
  }
}
Kopa.loadPrevSize = 10

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
