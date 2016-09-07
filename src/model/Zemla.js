/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var RemoteModel = require("./RemoteModel");
let WAMP= require("../WAMPFactory").getWAMP();
let _= require("lodash");

class Zemla extends RemoteModel {
    constructor() {
        super();

        this.name = undefined;
        // разрешенное количество собираемых коп в 1 год
        this.intensity = undefined;
        this.ownersCount = undefined;
        this.kopas= undefined;
        this.parent= undefined;
        this.children= undefined;
        this.rod= undefined;
    }

    /**
     * Плоское представление объекта по правилам секвилизы
     * для передачина в Server#model_save()
     * @param value
     */
    getPlain(){
        let result=  {
            id: this.id,
            name: this.name,
            intensity: this.intensity,
            parent_id: this.parent?this.parent.id:null,
            note: this.note,
            attachments:this.attachments?this.attachments.map(each=>each.id):[]
        };
        return result;
    }

    async onKopaStarted(args, kwargs, details){
        if (!this.kopas){
            this.log.debug("список коп еще не загружен");
            return;
        }

        let KOPA= args[0];

        let kopa= this.kopas.find(eachKopa=>eachKopa.id== KOPA);
        //стартовала копа, которая уже в списке
        if (kopa) {
            this.log.debug("стартовала копа, которая уже в списке");
        }
        //чужая копа, которой нет в списке
        else{
            kopa= await model.Kopa.get(KOPA);
            this.kopas.push(kopa);
            this.kopas= this.kopas.sort((a,b)=>(a.started||a.planned).getTime() - (b.started || b.planned).getTime());
        }
        this.emit(Zemla.event.kopaStarted, this, kopa);
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

    async reloadKopas(){
        this.kopas= await WAMP.session.call("ru.kopa.promiseKopas",[],{PLACE:this.id, BEFORE:null}, {disclose_me:true});
        this.emit(Zemla.event.kopasReloaded, this);
    }
}

Zemla.event={
    kopasReloaded: "kopasReloaded",
    kopaStarted: "kopaStarted"
};

module.exports = Zemla;