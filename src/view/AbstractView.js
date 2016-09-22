/**
 * Created by alexey2baranov on 8/25/16.
 */
"use strict";

let EventEmitter= require("events").EventEmitter;
let $= require("jquery");
// let models= require("../model"); ради jsdom тестов

/**
 * @param  model
 * @param {AbstractView} parent
 * @param {string} io
 * @constructor
 */
class AbstractView extends EventEmitter{
    constructor(model, parent, IO) {
        super();

        this.log= (global||window).log4javascript.getLogger(this.constructor.name);
        this.parent = parent;
        this.IO = IO;

        this.isVisible = false; //пока show() не вызвал он не может быть true

        this.modelListeners= new Map();

        if (model){
            this.setModel(model);
        }
    }

    /**
     * сохряняет слушателей в служебный массив
     * для дальнейшего снятия этих слушателей
     *
     * @param eventName
     * @param listener
     */
    setModelListener(eventName, listener){
        if (this.modelListeners.get(eventName)){
            throw new Error(`Слушатель на событие ${model}->${eventName} уже установлен`);
        }
        this.modelListeners.set(eventName, listener);
        this.model.on(eventName, listener);
    }

    setModelListeners(){
        let model= this.model;

        this.setModelListener("change", ()=>{
            this.invalidate();
        });
    }

    removeModelListeners(){
        for(let [eventName, listener] of this.modelListeners){
            this.model.removeListener(eventName, listener);
        }
    }

    /**
     * method to bind event handlers
     * and wrap properties with thiem views
     * do not use model property direct when settin
     * @type AbstractView
     */
    setModel(model) {
        if (this.model){
            this.removeModelListeners();
        }
        this.model = model;
        if (this.model) {
            this.setModelListeners();
        }

        return this;
    }

    /**
     * возвращает свой HTML
     */
    getHTML(){

    }

    /**
     * Возвращает свой HTML обернутый в jquery
     * сокращение для $(getHTML())
     */
    get$(){
        return $(this.getHTML());
    }

    get $(){
        return this.get$();
    }

    /**
     * привязать вьюшку к существующему HTML
     */
    attach(){

    }

    /**
     *
     * перерисовывает свое додержимое
     *
     * @type AbstractView
     */
    invalidate(){
        this.$.replaceAll(`${this.io}`);
    }

    getFullIO () {
        if (this.parent && this.IO) {
            return this.parent.getFullIO() + "_" + this.IO;
        }
        else if (this.parent) {
            return this.parent.getFullIO();
        }
        else {
            return this.IO;
        }
    }

    /**
     * shortcut for getFullIO()
     * чтобы разгрузить шаблоны
     * @returns {*}
     */
    get io(){
        return this.getFullIO();
    }

    /**
     * public method for outdor interface
     * do not override this method!!!
     * for customisation show process override doShow() protected method
     */
    show () {
        this.emit(AbstractView.event.BeforeShow, sender);
        this.isVisible = true;
        this._doShow();
    }

    /**
     * public method for outdor interface
     * do not override this method!!!
     * for customisation hide process override doHide() protected method
     */
    hide () {
        this.isVisible = false;
        this._doHide();
        // this.afterHide.call(this, {});
    }

    /**
     * protected method for customisation show process
     * need to be overriden in every view
     */
    _doShow  () {
    }

    /**
     * protected method for customisation hide process
     * need to be overriden in every view
     */
    _doHide () {
    }
}

AbstractView.event={
    BeforeShow:'Before_show',
};

module.exports= AbstractView;