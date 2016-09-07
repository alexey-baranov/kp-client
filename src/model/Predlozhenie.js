/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template Golos, choose Tools | Templates
 * and open the template in the editor.
 */
var RemoteModel= require("./RemoteModel");
let _= require("lodash");


class Predlozhenie extends RemoteModel{
    constructor() {
        super();

        this.value= undefined;
        this.place= undefined;
        this.initiator= undefined;
        this.votes= undefined;
    }

    getPlain(){
        let result=  {
            id: this.id,
            value: this.value,
            place_id: this.place?this.place.id:null,
            initiator_id: this.initiator?this.initiator.id:null,
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

    }

    toString(){
        return `${this.constructor.name} {${this.id}, "${this.value.substr(0,10)}"`;
    }
}

module.exports= Predlozhenie;