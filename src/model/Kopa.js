/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template Golos, choose Tools | Templates
 * and open the template in the editor.
 */
var RemoteModel= require("./RemoteModel");
let WAMP= require("../WAMPFactory").getWAMP();
let _= require("lodash");

class Kopa extends RemoteModel{
    constructor() {
        super();

        this.place= undefined;
        this.inviter= undefined;
        this.question= undefined;
        this.planned= undefined;
        this.started= undefined;
        this.closed= undefined;
        this.dialog= undefined;
        this.result= undefined;
    }

    getPlain(){
        let result=  {
            id: this.id,
            place_id: this.place?this.place.id:null,
            inviter_id: this.inviter?this.inviter.id:null,
            question: this.question,
            planned: this.planned,
            started: this.started,
            closed: this.closed,
            note: this.note,
            attachments:this.attachments?this.attachments.map(each=>each.id):[]
        };
        return result;
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

    async setQuestion(value){
        this.question= value;
        await WAMP.session.call("api:model.Kopa.setQuestion",null, {id:this.id, value: value}, {disclose_me:true});
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
        if (json.hasOwnProperty("planned")) {
            this.planned = json.planned;
        }
        if (json.hasOwnProperty("started")) {
            this.started = json.started;
        }
        if (json.hasOwnProperty("closed")) {
            this.closed = json.closed;
        }
        if (json.hasOwnProperty("note")) {
            this.note = json.note;
        }
        if (json.hasOwnProperty("attachments")) {
            this.attachments = json.attachments.map(EACH_ATTACHMENT=>File.getReference(EACH_ATTACHMENT));
        }

        if (json.hasOwnProperty("question") && this.question!=prevState.question ||
            json.hasOwnProperty("planned") && this.planned!=prevState.planned ||
            json.hasOwnProperty("started") && this.started!=prevState.started ||
            json.hasOwnProperty("closed") && this.closed!=prevState.closed ||
            json.hasOwnProperty("note") && this.note!=prevState.note ||
            json.hasOwnProperty("attachments") && _.difference(this.attachments,prevState.attachments).length){

            this.emit(RemoteModel.event.change, this);
        }
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