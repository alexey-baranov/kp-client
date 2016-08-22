/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var RemoteModel= require("./RemoteModel");

class Zemla extends RemoteModel {
    constructor() {
        super();

        this.name= undefined;
        // разрешенное количество собираемых коп в 1 год
        this.intensity= undefined;
        this.ownersCount= undefined;
    }

    /**
     *  вливает новое состояние в объект и вызывает события
     */
    merge(json){
        var prevState= {};
        Object.assign(prevState, this);

        this._isLoaded= true;

        this.name = json.name;
        this.intensity= json.intensity;
        this.ownersCount= json.ownersCount;
        this.attachments= json.attachments.map(EACH_ATTACHMENT=>File.getReference(EACH_ATTACHMENT));
        return result;
    }
}

module.exports= Zemla;