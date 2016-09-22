/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
"use strict";

var RemoteModel= require("./RemoteModel");
let _= require("lodash");


class File extends RemoteModel{
    constructor() {
        super();

        this.name = undefined;
        this.size = undefined;
        this.mimeType = undefined;
    }

    getPlain(){
        let result=  {
            id: this.id,
            name: this.name,
            size: this.size,
            mimeType: this.mimeType,
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

        this.name= json.name;
        this.size= json.size;
        this.mimeType= json.mimeType;
    }
}

module.exports= File;