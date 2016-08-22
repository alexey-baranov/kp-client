/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template Golos, choose Tools | Templates
 * and open the template in the editor.
 */
var RemoteModel= require("./RemoteModel");


class Golos extends RemoteModel{
    constructor() {
        super();

    }

    /**
     *  вливает новое состояние в объект и вызывает события
     */
    merge(json){
        var prevState= {};
        Object.assign(prevState, this);

        this._isLoaded= true;

    }
}

module.exports= Golos;