/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
"use strict";

var DisplacingTimer= require("displacing-timer");
var RemoteModel= require("./RemoteModel");
let _= require("lodash");
let WAMPFactory = require("../WAMPFactory");


class Kopnik extends RemoteModel{
    constructor() {
        super();

        this.onlineTimer= new DisplacingTimer(this, this.onlineTimer_tick, Kopnik.OFFLINE_INTERVAL-1500, DisplacingTimer.Type.Interval);

        this.email= undefined;
        this.name = undefined;
        this.surname = undefined;
        this.patronymic = undefined;
        this.birth= undefined;
        this.isOnline= undefined;

        this.dom= undefined;
        this.starshina= undefined;
        this.druzhina= undefined;

        this.voiskoSize= undefined;

        this.invited= undefined;
        this.initiated= undefined;
        this.sayd= undefined;
    }

    getPlain(){
        let result=  {
            id: this.id,
            email: this.email,
            name: this.name,
            surname: this.surname,
            patronymic: this.patronymic,
            birth: this.birth,
            dom_id: this.dom?this.dom.id:null,
            starshina_id: this.starshina?this.starshina.id:null,
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

        this.email= json.email;
        this.name= json.name;
        this.surname= json.surname;
        this.patronymic= json.patronymic;
        this.birth= json.birth;
        this.isOnline= json.isOnline;
        this.note= json.note;

        this.dom= Zemla.getReference(json.dom_id);
        this.attachments= json.attachments.map(EACH_ATTACHMENT=>File.getReference(EACH_ATTACHMENT));

        if (this.email!=prevState.email || this.name!=prevState.name || this.surname!=prevState.surname ||
            this.patronymic!=prevState.patronymic || this.birth !=prevState.birth || this.note!=prevState.note ||
            this.dom!=prevState.dom ||
            _.difference(this.attachments,prevState.attachments).length){

            this.emit(Kopnik.event.change, this);
        }
    }

    async onPublication(args, kwargs, details){
        await super.onPublication(args, kwargs, details);
        if (details.topic.match(/\.voiskoChange$/)){
            this.voiskoSize= kwargs.voiskoSize;
            this.emit(Kopnik.event.voiskoChange, this);

            if (this.druzhina){
                throw new Error("дружина устарела");
            }
        }
        else if (details.topic.match(/\.starshinaChange$/)){
            this.emit(Kopnik.event.starshinaChange, this);
        }
    }

    async setStarshina(value){
        if (!WAMPFactory.getWAMP().session){
            let x=1;
        }
        await WAMPFactory.getWAMP().session.call("api:model.Kopnik.setStarshina", null, {KOPNIK: this.id, STARSHINA:value.id});
        this.starshina= value;
        this.emit(Kopnik.event.starshinaChange, this);
    }

    updateLastActiveTime(){

    }

    onlineTimer_tick(){
        this.updateLastActiveTime();
    }

    beOnline(){
        this.onlineTimer.start();
        return this.updateLastActiveTime();
    }

    toString(){
        return `${this.constructor.name} {${this.id}, "${this.surname} ${this.name}"}`;
    }
}

Kopnik.Status= {
    Offline: -1,
    Online: 1
};

Kopnik.OFFLINE_INTERVAL=5000;

Kopnik.event={
    voiskoChange: "voiskoChange",
    starshinaChange: "starshinaChange",
};

module.exports= Kopnik;


let Zemla= require("./Zemla");
let File= require("./File");