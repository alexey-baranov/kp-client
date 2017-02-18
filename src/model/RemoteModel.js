/**
 * Created by alexey2baranov on 5/13/16.
 */
"use strict";
let EventEmitter = require("events").EventEmitter;

var DisplacingTimer = require("displacing-timer");
let Core = require("./../Core");
let Connection =require("../Connection").default
let _ = require("lodash");
let join = require("../decorator/join").default


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
class RemoteModel extends EventEmitter {
  constructor() {
    super()
    this.log = require("loglevel").getLogger(this.constructor.name)

    this._isLoaded = false;
    this._isSubscribedToWAMPPublications = false;
    this.id = undefined;
    this.note = undefined;
    this.attachments = []

    this.joinedLoaded= join(this.loaded);
    /**
     * у новвой предсозданой на клиенте модели его нет
     * потому что он еще не созан на сервере
     * точно так же как нет и id
     */
    this.created = undefined;
  }

  static cache = new Map([
    ["Zemla", new Map()],
    ["Registration", new Map()],
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
  static getPlain(value) {
    let result = {};
    for (let eachKey of Object.keys(value)) {
      let eachProperty = value[eachKey];

      if (_.isArray(eachProperty)) {
        result[eachKey] = [];
        for (let eachPropertyEachReference of eachProperty) {
          if (!_.isObject(eachPropertyEachReference)) {
            throw new Error(`arrays of RemoteModels only supported, ${typeof eachPropertyEachReference} given`);
          }
          if (!(eachPropertyEachReference instanceof RemoteModel)) {
            throw new Error(`arrays of RemoteModels only supported, ${eachPropertyEachReference.constructor.name} given`);
          }
          result[eachKey].push(eachPropertyEachReference.id);
        }
      }
      else if (_.isObject(eachProperty) && !(eachProperty instanceof Date)) {
        if (!(eachProperty instanceof RemoteModel)) {
          throw new Error(`reference to RemoteModels only supported, ${eachProperty.constructor.name} given`);
        }
        result[eachKey + "_id"] = eachProperty.id;
      }
      else {
        result[eachKey] = eachProperty;
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
  onPublication(args, kwargs, details) {
    if (details.topic.match(/\.change$/)) {
      return this.reload()
        .then(() => {
          this.emit(RemoteModel.event.change, this);
        })
    }
    else {
      return Promise.resolve();
    }
  }

  static clearCache() {
    this.cache.forEach(eachCache => eachCache.clear());
  }

  async save() {
    let plain = this.getPlain()
    let result = await Connection.getInstance().session.call("api:model.save", [], {
      type: this.constructor.name,
      plain: plain
    })
    return result
  }

  static async create(value) {
    if (!value.attachments) {
      value.attachments = [];
    }
    /**
     * если сюда передался id, то ниже он перекроет собой настоящий id
     */
    delete value.id
    delete value.created
    // let plain= this.getPlain(value);
    let plain = this.prototype.getPlain.call(value);
    let {id, created} = await Connection.getInstance().session.call("api:model.create", [], {
      type: this.name,
      plain: plain
    });
    id = parseInt(id)
    created= new Date(created)

    let result = this.getReference(id)
    Object.assign(result, value)
    result.created= created
    result._isLoaded = true

    await result.subscribeToWAMPPublications();

    return result;
  }

  async destroy() {
    await Connection.getInstance().session.call("api:model.destroy", [], {
      type: this.constructor.name,
      id: this.id
    })

    //todo: отписка
    // await result.unsubscribeToWAMPPublications();
  }



  static getReference(id) {
    if (!id) {
      throw new Error("Не указан идентификатор объекта id=" + JSON.stringify(id));
    }
    if (_.isString(id)) {
      id = parseInt(id);
    }
    if (!this.cache.has(this.name)) {
      throw new Error("Неправильный тип объекта " + this.name);
    }

    if (!this.cache.get(this.name).has(id)) {
      let reference = new this();

      reference.id = id;
      reference._isLoaded = false;

      this.cache.get(this.name).set(id, reference);
    }
    return this.cache.get(this.name).get(id);
  }

  /**
   * Дает существующую модель или подгружает ее с сервера
   *
   * @param what
   * @return {Promise.<*>}
   */
  static async get(what) {
    let result;

    if (_.isNumber(what) || _.isString(what)) {
      result = this.getReference(what);
      if (!result._isLoaded) {
        await result.reload();
      }
      return result;
    }
    else {
      result = this.getReference(what.id);
      if (!result._isLoaded){
        await result.merge(what);
      // }
      // if (!result._isSubscribedToWAMPPublications) {
        await result.subscribeToWAMPPublications();
      }
      return result;
    }
  }


  /**
   * загружает все поля в томи числе скалярные и ссылки на другие объеты
   * @returns {Promise.<RemoteModel>}
   */
  async reload(source) {
    let isLoadedBefore = this._isLoaded;

    let json = await Connection.getInstance().session.call("ru.kopa.model.get", [], {
      model: this.constructor.name,
      id: this.id
    });

    /**
     * есть вероятность что ушло два параллельных .get()
     * или текущий .get() начинался внутри .create()
     * и к этому моменту модель уже загружена
     */
    if (!isLoadedBefore && this._isLoaded) {
      // this.log.debug(`${this} loaded in concurent thread. merging skipped. subscription skipped`);
    }
    else if (!isLoadedBefore) {
      await this.merge(json)
      await this.subscribeToWAMPPublications()
    }
    /**
     * модель уже загружена и ее обновляют
     * скорее всего это reload() по ->change
     */
    else {
      await this.merge(json)
    }
    this.log.debug(`reloaded ${this}`, this)

    return this;
  }

  async subscribeToWAMPPublications() {
    if (this._isSubscribedToWAMPPublications) {
      throw new Error(`${this} allready subscribed to WAMP publications`);
    }
    /**
     * это устанавливается до подписки потому что в противном случае возможна маленькая вероятность того
     * что две подписки произойдут одновременно в двух потоках
     */
    this._isSubscribedToWAMPPublications = true;
    await this.subscribeHelper(`api:model.${this.constructor.name}.id${this.id}.`, this.onPublication, {match: 'wildcard'}, this);
  }


  /**
   * Возвращает загруженный объект
   * если он еще не загружен, то загружает
   * @returns {Promise.<RemoteEntity>}
   */
  loaded() {
    if (!this._isLoaded) {
      return this.reload();
    }
    else {
      return Promise.resolve(this);
    }
  }

  /**
   * не стоит делать слияние здесь в родительском классе моделей,
   * потому что в таком случае пропадет возможность анализировать события
   * noteChanged, attachmentsChanged, firstTimeLoadedChanged внутри моделей
   */
  async merge() {

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

  toString() {
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
    if (!handler) {
      throw new Error("subscribeHelper(handler==null)", topic);
    }
    let result = await Connection.getInstance().session.subscribe(topic, async(args, kwargs, details) => {
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

RemoteModel.event = {
  change: "change"
};

module.exports = RemoteModel;

let Kopnik = require("./Kopnik")
