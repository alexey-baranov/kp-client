/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template Golos, choose Tools | Templates
 * and open the template in the editor.
 */
"use strict";

var RemoteModel= require("./RemoteModel");
let _= require("lodash");


class Predlozhenie extends RemoteModel{
    constructor() {
        super();

        this.value= undefined;
        this.place= undefined;
        this.author= undefined;
        this.golosa= undefined;
        this.totalZa= undefined;
        this.totalProtiv= undefined;
    }

    getPlain(){
        let result=  {
            id: this.id,
            value: this.value,
            place_id: this.place?this.place.id:null,
            author_id: this.author?this.author.id:null,
            note: this.note,
            attachments:this.attachments?this.attachments.map(each=>each.id):[]
        };
        return result;
    }

    /**
     *  вливает новое состояние в объект и вызывает события
     */
    merge(json){
        var prevState= {};
        Object.assign(prevState, this);

        this._isLoaded= true;

        if (json.hasOwnProperty("value")) {
            this.value = json.value;
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

        this.totalZa= json.totalZa;
        this.totalProtiv= json.totalProtiv;

        if (json.hasOwnProperty("value") && this.value!=prevState.value ||
            json.hasOwnProperty("note") && this.note!=prevState.note ||
            this.totalZa!=prevState.totalZa ||
            this.totalProtiv!=prevState.totalProtiv ||
            this.author!=prevState.author ||
            json.hasOwnProperty("place_id") && this.place!= prevState.place ||
            json.hasOwnProperty("attachments") && _.difference(this.attachments,prevState.attachments).length){

            this.emit(RemoteModel.event.change, this);
        }
    }

    async onPublication(args, kwargs, details){
        await super.onPublication(args, kwargs, details);
        if (details.topic.match(/\.golosAdd$/)){
            if (this.golosa){
                let golos= await Golos.get(args[0]);
                this.golosa.push(golos);
                this.emit(Predlozhenie.event.golosAdd, this, golos);
            }
        }
    }

    toString(){
        return `${this.constructor.name} {${this.id}, "${this.value.substr(0,10)}"}`;
    }
}

Predlozhenie.event={
    golosaReload: "golosaReload",
    golosAdd: "golosAdd",
};

module.exports= Predlozhenie;

let Kopnik= require("./Kopnik");
let Kopa= require("./Kopa");
let Golos= require("./Golos");