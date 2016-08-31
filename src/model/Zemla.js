/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var RemoteModel = require("./RemoteModel");
let _ = require("lodash");

class Zemla extends RemoteModel {
    constructor() {
        super();

        this.name = undefined;
        // разрешенное количество собираемых коп в 1 год
        this.intensity = undefined;
        this.ownersCount = undefined;
    }

    /**
     *  вливает новое состояние в объект и вызывает события
     */
    merge(json) {
        var prevState = {};
        Object.assign(prevState, this);

        this._isLoaded = true;

        this.name = json.name;
        this.intensity = json.intensity;
        this.rodCount = json.rodCount;
        if(json.parent_id){
            this.parent= Zemla.getReference(json.parent_id);
        }
        else{
            this.parent= null;
        }
        this.attachments = json.attachments.map(EACH_ATTACHMENT=>File.getReference(EACH_ATTACHMENT));

        if (this.name != prevState.name || this.intensity != prevState.intensity ||
            this.rodCount != this.rodCount || _.difference(this.attachments, prevState.attachments).length) {

            this.emit(Zemla.event.change, this);
        }
    }
}

module.exports = Zemla;