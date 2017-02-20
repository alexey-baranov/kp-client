/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template Golos, choose Tools | Templates
 * and open the template in the editor.
 */
"use strict";

var RemoteModel= require("./RemoteModel");
let _= require("lodash");


class Slovo extends RemoteModel{
    constructor() {
        super()
        this.value= undefined;

        this.owner= undefined;
        this.place= undefined;
        this.created= undefined;
    }

    getPlain(){
        let result=  {
            id: this.id,
            place_id: this.place?this.place.id:null,
            owner_id: this.owner?this.owner.id:null,
            value: this.value,
            note: this.note,
            attachments:this.attachments?this.attachments.map(each=>each.id).filter(each=>each):[],
            created: this.created?this.created.toISOString():[]
        };
        return result;
    }

    /**
     *  вливает новое состояние в объект и вызывает события
     */
    async merge(json){
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
          this.attachments = json.attachments.map(each => File.getReference(each.id))
        }
        if (json.hasOwnProperty("owner_id")) {
            this.owner = Kopnik.getReference(json.owner_id);
        }
        if (json.hasOwnProperty("place_id")) {
            this.place = Kopa.getReference(json.place_id);
        }
        this.created= new Date(json.created_at);

        if (json.hasOwnProperty("value") && this.value!=prevState.value ||
            json.hasOwnProperty("note") && this.note!=prevState.note ||
            json.hasOwnProperty("owner_id") && this.owner!=prevState.owner ||
            json.hasOwnProperty("place_id") && this.place!= prevState.place ||
            json.hasOwnProperty("attachments") && _.difference(this.attachments,prevState.attachments).length){

            this.emit(RemoteModel.event.change, this);
        }
    }
    toString(){
        return `${this.constructor.name} {${this.id}, "${this.value}"}`;
    }
}

module.exports= Slovo;

let File= require("./File")
let Kopa= require("./Kopa");
let Kopnik= require("./Kopnik");
