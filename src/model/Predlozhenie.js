/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template Golos, choose Tools | Templates
 * and open the template in the editor.
 */
"use strict";

var RemoteModel = require("./RemoteModel");
let _ = require("lodash");
import Connection from "../Connection"

class Predlozhenie extends RemoteModel {
    constructor() {
        super();

        this.value = undefined;
        this.place = undefined;
        this.author = undefined;
        this.state = undefined;
        this.golosa = undefined; //массив ПРЯМЫХ голосов, голоса дружины здесь не числятся потому что этот массив будет раздут до нескольких миллионов элементов
        this.totalZa = undefined;
        this.totalProtiv = undefined;
    }

    getPlain() {
        let result = {
            id: this.id,
            value: this.value,
            state: this.state,
            place_id: this.place ? this.place.id : null,
            author_id: this.author ? this.author.id : null,
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
            this.attachments = json.attachments.map(EACH_ATTACHMENT=>File.getReference(EACH_ATTACHMENT));
        }
        if (json.hasOwnProperty("author_id")) {
            this.author = Kopnik.getReference(json.author_id);
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
            this.author != prevState.author ||
            json.hasOwnProperty("place_id") && this.place != prevState.place ||
            json.hasOwnProperty("attachments") && _.difference(this.attachments, prevState.attachments).length) {

            this.emit(RemoteModel.event.change, this);
        }
    }

    async onPublication(args, kwargs, details) {
        await super.onPublication(args, kwargs, details);
        if (details.topic.match(/\.rebalance$/)) {
            if (this.golosa) {
                this.totalZa = kwargs.totalZa;
                this.totalProtiv = kwargs.totalProtiv;
                let golos;
                switch (kwargs.action) {
                    case "add":
                        golos = await Golos.get(kwargs["GOLOS"]);
                        this.golosa.push(golos);
                        break;
                    case "remove":
                        this.golosa = this.golosa.filter(eachGolos=>eachGolos.id != kwargs["GOLOS"]);
                        break;
                    case "update":
                        golos = this.golosa.find(eachGolos=>eachGolos.id = kwargs["GOLOS"]);
                        if (golos) {
                            golos.value = kwargs.value;
                        }
                        break;
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

        let golosa = await Promise.all(golosaAsPlain.map(async eachGolosAsPlain => {
            let eachGolos = Golos.getReference(eachGolosAsPlain.id);
            eachGolos.merge(eachGolosAsPlain);
            await eachGolos.subscribeToWAMPPublications();
            return eachGolos;
        }));

        this.golosa = golosa;
        this.emit(Predlozhenie.event.golosaReload, this);

        return this.golosa;
    }

    get za() {
        if (!this.golosa) {
            return undefined;
        }
        return this.golosa.filter(eachGolos=>eachGolos.value == 1);
    }

    get protiv() {
        if (!this.golosa) {
            return undefined;
        }
        return this.golosa.filter(eachGolos=>eachGolos.value == -1);
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

let Kopnik = require("./Kopnik");
let Kopa = require("./Kopa");
let Golos = require("./Golos");
