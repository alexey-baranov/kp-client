/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template Golos, choose Tools | Templates
 * and open the template in the editor.
 */
"use strict";

var RemoteModel= require("./RemoteModel");
let WAMP= require("../WAMPFactory").getWAMP();
let _= require("lodash");

class Kopa extends RemoteModel{
    constructor() {
        super();

        this.place= undefined;
        this.inviter= undefined;
        this.question= undefined;
        this.invited= undefined;
        this.dialog= undefined;
        this.result= undefined;
    }

    getPlain(){
        let result=  {
            id: this.id,
            place_id: this.place?this.place.id:null,
            inviter_id: this.inviter?this.inviter.id:null,
            question: this.question,
            invited: this.invited,
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

        if (json.hasOwnProperty("question") && this.question!=prevState.question ||
            json.hasOwnProperty("invited") && this.invited!=prevState.invited ||
            json.hasOwnProperty("note") && this.note!=prevState.note ||
            json.hasOwnProperty("attachments") && _.difference(this.attachments,prevState.attachments).length){

            this.emit(RemoteModel.event.change, this);
        }
    }


    async onPublication(args, kwargs, details){
        await super.onPublication(args, kwargs, details);
        if (details.topic.match(/\.slovoAdd$/)){
            if (this.dialog){
                let slovo= await Slovo.get(args[0]);
                this.dialog.push(slovo);
                this.emit(Kopa.event.slovoAdd, this, slovo);
            }
        }
        else if (details.topic.match(/\.predlozhenieAdd$/)){
            if (this.result){
                let predlozhenie= await Predlozhenie.get(args[0]);
                this.result.push(predlozhenie);
                this.emit(Kopa.event.predlozhenieAdd, this, predlozhenie);
            }
        }
    }

    async invite(value){
        await WAMP.session.call("api:model.Kopa.invite", null, {id:this.id}, {disclose_me:true});
    }


    toString(){
        return `${this.constructor.name} {${this.id}, "${this.question.substring(0, 10)}"}`;
    }
}

Kopa.event={
    slovaReloaded: "slovaReloaded",
    slovoAdd: "slovoAdd",
    predlozhenieAdd: "predlozhenieAdd",
};

module.exports= Kopa;

let Slovo= require("./Slovo");
let Predlozhenie= require("./Predlozhenie");