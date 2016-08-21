/**
 * Created by alexey2baranov on 5/13/16.
 */

"use strict";

var DisplacingTimer= require("displacing-timer");
let Core= require("./../Core");
let EventEmitter= require("events").EventEmitter;

/**
 * Общий принцип работы следующий
 * #find(id) возвращает объект у которого ассоциации в виде ссылок (не loaded() -нутые объекты)
 * перед тем как такой объект использовать необходимо выполенить его .load()
 *
 * #find(1)
 * .then (kopnik=>{
 *      echo kopnik.iInviteSomebody.id;
 *      kopnik.iInviteSomebody.loaded()
 *      .then(()=>{
 *          echo kopnik.iInviteSomebody.status
 *      })
 * })
 *
 * Для того чтобы сделать объект синхронизированным нужно вызвать .refreshCycle(3000)
 */
class RemoteModel/* extends EventEmitter*/{
    constructor(id) {
        this._isLoaded = false;
        this.id = id;
        this.note= undefined;
        this.attachments= undefined;
    }

    static getReference(id){
        if (!id) {
            throw new Error("Не указан идентификатор объекта id=" + JSON.stringify(id));
        }
        if (!this.cache.get(this.name).has(id)) {
            var reference= null;
            switch(this.name) {
                case "Kopnik":
                    reference= new Kopnik(id);
                    break;
                default:
                    throw new Error("Неправильный тип объекта "+this);
            }
            reference.id= id;
            reference._isLoaded= false;

            this.cache.get(this.name).set(id, reference);
        }
        return this.cache.get(this.name).get(id);
    }


    /**
     * загружает все поля в томи числе скалярные и ссылки на другие объеты
     * @returns {Promise.<RemoteModel>}
     */
    async refresh(){
        let json= await Core.getWAMP().session.call("ru.kopa.model.get",null,{
            model:this.constructor.name,
            id:this.id});
        this.merge(json);

        // console.log(this, "merged");

        return this;
    }


    /**
     * Возвращает загруженный объект
     * если он еще не загружен, то загружает
     * @returns {Promise.<RemoteEntity>}
     */
    loaded(){
        if (!this._isLoaded) {
            return this.refresh();
        }
        else{
            return Promise.resolve(this);
        }
    }

    /**
     * не стоит делать слияние здесь в родительском классе моделей,
     * потому что в таком случае пропадет возможность анализировать события
     * noteChanged, attachmentsChanged, firstTimeLoadedChanged внутри моделей
     */
    merge(){

    }
}

RemoteModel.cache= new Map([
    ["Kopnik", new Map()],
    ["Invite", new Map()],
    ["Room", new Map()],
    ["Queue", new Map()]
]);

module.exports= RemoteModel;

let Kopnik= require("./Kopnik");