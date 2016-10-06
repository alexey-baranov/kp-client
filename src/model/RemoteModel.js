/**
 * Created by alexey2baranov on 5/13/16.
 */
"use strict";

var DisplacingTimer= require("displacing-timer");
let Core= require("./../Core");
let EventEmitter= require("events").EventEmitter;
let WAMPFactory = require("../WAMPFactory");
let _= require("lodash");


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
class RemoteModel extends EventEmitter{
    constructor() {
        super();
        this.log= global.log4javascript.getLogger(this.constructor.name);

        this._isLoaded = false;
        this.id = undefined;
        this.note= undefined;
        this.attachments= undefined;


    }

    static cache= new Map([
        ["Zemla", new Map()],
        ["Kopnik", new Map()],
        ["Kopa", new Map()],
        ["Predlozhenie", new Map()],
        ["Slovo", new Map()],
        ["Golos", new Map()],
        ["File", new Map()]
    ]);


    /**
     * Плоское представление объекта по правилам секвилизы для передачина на сервер
     */
    static getPlain(value){
        let result= {};
        for(let eachKey of Object.keys(value)){
            let eachProperty= value[eachKey];

            if(_.isArray(eachProperty)){
                result[eachKey]=[];
                for(let eachPropertyEachReference of eachProperty){
                    if (!_.isObject(eachPropertyEachReference)){
                        throw new Error(`arrays of RemoteModels only supported, ${typeof eachPropertyEachReference} given`);
                    }
                    if (!(eachPropertyEachReference instanceof RemoteModel)){
                        throw new Error(`arrays of RemoteModels only supported, ${eachPropertyEachReference.constructor.name} given`);
                    }
                    result[eachKey].push(eachPropertyEachReference.id);
                }
            }
            else if (_.isObject(eachProperty) && !(eachProperty instanceof Date)){
                if (!(eachProperty instanceof RemoteModel)){
                    throw new Error(`reference to RemoteModels only supported, ${eachProperty.constructor.name} given`);
                }
                result[eachKey+"_id"]= eachProperty.id;
            }
            else{
                result[eachKey]= eachProperty;
            }
        }

        return result;
    }

/*    async onPublication(args, kwargs, details){
        if (details.topic.match(/\.change$/)){
            await this.reload();
            this.emit(RemoteModel.event.change, this);
        }
    }*/
    onPublication(args, kwargs, details){
        if (details.topic.match(/\.change$/)){
            return this.reload()
                .then(()=>{
                    this.emit(RemoteModel.event.change, this);
                });
        }
        else{
            return Promise.resolve();
        }
    }

    static clearCache(){
        this.cache.forEach(eachCache=>eachCache.clear());
    }

    async save(){
        let plain= this.getPlain();
        let result= await WAMPFactory.getWAMP().session.call("api:model.save", [], {
            type: this.constructor.name,
            plain: plain});
        return result;
    }

    static async create(value){
        if (!value.attachments){
            value.attachments=[];
        }
        // let plain= this.getPlain(value);
        let plain= this.prototype.getPlain.call(value);
        let id= await WAMPFactory.getWAMP().session.call("api:model.create", [], {
            type: this.name,
            plain: plain});
        id = parseInt(id);

        let result= this.getReference(id);
        Object.assign(result, value);
        result._isLoaded= true;

        await result.subscribeToWAMPPublications();

        return result;
    }

    static getReference(id){
        if (!id) {
            throw new Error("Не указан идентификатор объекта id=" + JSON.stringify(id));
        }
        if (_.isString(id)){
            id= parseInt(id);
        }
        if (!this.cache.has(this.name)){
            throw new Error("Неправильный тип объекта "+this.name);
        }

        if (!this.cache.get(this.name).has(id)) {
            let reference= new this();

            reference.id= id;
            reference._isLoaded= false;

            this.cache.get(this.name).set(id, reference);
        }
        return this.cache.get(this.name).get(id);
    }

    static get(id){
        let result= this.getReference(id);

        return result._isLoaded?Promise.resolve(result):result.reload();
    }


    /**
     * загружает все поля в томи числе скалярные и ссылки на другие объеты
     * @returns {Promise.<RemoteModel>}
     */
    async reload(){
        let isLoadedBefore= this._isLoaded;
        let json= await WAMPFactory.getWAMP().session.call("ru.kopa.model.get",[],{
            model:this.constructor.name,
            id:this.id});

        /**
         * есть вероятность что ушло два параллельных .get()
         * или текущий .get() начинался внутри .create()
         * и к моменту #merge() модель уже загружена
         */
        if (!isLoadedBefore && this._isLoaded){
            // this.log.debug(`${this} loaded in concurent thread. merging skipped. subscription skipped`);
        }
        else if (!isLoadedBefore){
            this.merge(json);
            await this.subscribeToWAMPPublications();
        }
        else {
            this.merge(json);
        }
        return this;
    }

    async subscribeToWAMPPublications(){
        await this.subscribeHelper(`api:model.${this.constructor.name}.id${this.id}.`, this.onPublication, {match: 'wildcard'}, this);
    }


    /**
     * Возвращает загруженный объект
     * если он еще не загружен, то загружает
     * @returns {Promise.<RemoteEntity>}
     */
    loaded(){
        if (!this._isLoaded) {
            return this.reload();
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

/*    onHelper(event, handlerWithoutContext, context){
        this.on(event, ()=>{
            if (context){
                handlerWithoutContext.apply(context, arguments);
            }
            else{
                throw new Error("not tested without context");
                handlerWithoutContext(arguments);
            }
        });
    }*/

    toString(){
        return `${this.constructor.name} {${this.id}, "${this.name}"}`;
    }

    /**
     * обертака над стандартной autobahn.Session#subscribe()
     * допом принимает контекст обработчика
     * и конввертирует обычне Error в autobahn.Error, которые только одни передаются по WAMP
     *
     * @return {Promise<autobahn.Subscription>}
     */
    async subscribeHelper(topic, handler, options, context) {
        if (!handler){
            throw new Error("subscribeHelper(handler==null)", topic);
        }
        let result = await WAMPFactory.getWAMP().session.subscribe(topic, async(args, kwargs, details)=> {
            try {
                if (context) {
                    await handler.call(context, args, kwargs, details);
                }
                else {
                    throw new Error("not tested");
                    await handler(args, kwargs, details);
                }
            }
            catch (err) {
                this.log.error(this.toString(), `error on "${details.topic}" subscription`, err, err.stack);
                throw err;
            }
        }, options);
        // this.log.debug(`${this} subscribed to "${topic}"`);
        return result;
    };
}

RemoteModel.event={
    change: "change"
};

module.exports= RemoteModel;

let Kopnik= require("./Kopnik");