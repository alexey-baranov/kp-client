/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template Golos, choose Tools | Templates
 * and open the template in the editor.
 */
var RemoteModel= require("./RemoteModel");
let _= require("lodash");


class Golos extends RemoteModel{
    constructor() {
        super();

        this.value= undefined;
        this.owner= undefined;
        this.for= undefined;
    }

    getPlain(){
        let result=  {
            id: this.id,
            value: this.value,
            owner_id: this.owner?this.owner.id:null,
            for_id: this.for?this.for.id:null,
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
        return `${this.constructor.name} {${this.id}, ${this.value}}`;
    }
}

module.exports= Golos;