/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template Golos, choose Tools | Templates
 * and open the template in the editor.
 */
"use strict";

var RemoteModel = require("./RemoteModel");
let WAMP = require("../WAMPFactory").getWAMP();
let _ = require("lodash");

class Kopa extends RemoteModel {
    constructor() {
        super();

        this.place = undefined;
        this.inviter = undefined;
        this.question = undefined;
        this.invited = undefined;
        this.dialog = undefined;
        this.result = undefined;
    }

    getPlain() {
        let result = {
            id: this.id,
            place_id: this.place ? this.place.id : null,
            inviter_id: this.inviter ? this.inviter.id : null,
            question: this.question,
            invited: this.invited,
            note: this.note,
            attachments: this.attachments ? this.attachments.map(each=>each.id) : []
        };
        return result;
    }

    /**
     *  вливает новое состояние в объект и вызывает события
     */
    merge(json) {
        var prevState = {};
        Object.assign(prevState, this);

        this._isLoaded = true;

        if (json.hasOwnProperty("question")) {
            this.question = json.question;
        }
        if (json.hasOwnProperty("invited")) {
            this.invited = json.invited;
        }
        if (json.hasOwnProperty("note")) {
            this.note = json.note;
        }
        if (json.hasOwnProperty("attachments")) {
            this.attachments = json.attachments.map(EACH_ATTACHMENT=>File.getReference(EACH_ATTACHMENT));
        }

        if (json.hasOwnProperty("question") && this.question != prevState.question ||
            json.hasOwnProperty("invited") && this.invited != prevState.invited ||
            json.hasOwnProperty("note") && this.note != prevState.note ||
            json.hasOwnProperty("attachments") && _.difference(this.attachments, prevState.attachments).length) {

            this.emit(RemoteModel.event.change, this);
        }
    }


    async onPublication(args, kwargs, details) {
        console.log(this.question, "onPublication");
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
    }

    async invite(value) {
        await WAMP.session.call("api:model.Kopa.invite", null, {id: this.id}, {disclose_me: true});
    }

    /**
     * подгружает диалог
     * или предыдущую порцию, если он уже начат загружаться
     */
    async loadDialog() {
        let BEFORE = this.dialog && this.dialog.length ? this.dialog[0].created.getTime() : null;
        let dialogAsPlain = await WAMP.session.call("api:model.Kopa.getDialog", [], {
            PLACE: this.id,
            BEFORE: BEFORE
        }, {disclose_me: true});

        let dialog = await Promise.all(dialogAsPlain.map(async eachSlovoAsPlain => {
            let eachSlovo = Slovo.getReference(eachSlovoAsPlain.id);
            eachSlovo.merge(eachSlovoAsPlain);
            await eachSlovo.subscribeToWAMPPublications();
            return eachSlovo;
        }));

        if (!this.dialog || !this.dialog.length) {
            this.dialog = dialog;
        }
        else {
            this.dialog = dialog.concat(this.dialog);
        }
        this.emit(Kopa.event.dialogLoad, this);

        return this.dialog;
    }

    /**
     * подгружает результат
     * или предыдущую порцию, если он уже начат загружаться
     */
    async loadResult() {
        let BEFORE = this.result && this.result.length ? this.result[0].created.getTime() : null;
        let resultAsPlain = await WAMP.session.call("api:model.Kopa.getResult", [], {
            PLACE: this.id,
            BEFORE: BEFORE
        }, {disclose_me: true});

        let result = await Promise.all(resultAsPlain.map(async eachResultAsPlain => {
            let eachResult = Predlozhenie.getReference(eachResultAsPlain.id);
            eachResult.merge(eachResultAsPlain);
            await eachResult.subscribeToWAMPPublications();
            return eachResult;
        }));

        if (!this.result || !this.result.length) {
            this.result = result;
        }
        else {
            this.result = result.concat(this.result);
        }
        this.emit(Kopa.event.resultLoad, this);

        return this.result;
    }

    toString() {
        return `${this.constructor.name} {${this.id}, "${this.question.substring(0, 10)}"}`;
    }
}

Kopa.event = {
    slovoAdd: "slovoAdd",
    predlozhenieAdd: "predlozhenieAdd",
    dialogLoad: "dialogLoad",
    resultLoad: "resultLoad",
};

module.exports = Kopa;

let Slovo = require("./Slovo");
let Predlozhenie = require("./Predlozhenie");