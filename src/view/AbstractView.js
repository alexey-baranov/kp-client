/**
 * Created by alexey2baranov on 8/25/16.
 */
let EventEmitter= require("events").EventEmitter;
let $= require("jquery");

/**
 * @param  model
 * @param {AbstractView} parent
 * @param {string} io
 * @constructor
 */
class AbstractView extends EventEmitter{
    constructor(model, parent, IO) {  //can't find setModel() from constructor()
        super();
        // this.log = log4javascript.getLogger(this.constructor.name);
        this.parent = parent;
        this.IO = IO;

        this.isVisible = false; //пока show() не вызвал он не может быть true

        this.setModel(model);
    }

    /**
     * method to bind event handlers
     * and wrap properties with thiem views
     * do not use model property direct when settin
     * @type AbstractView
     */
    setModel(model) {
        this.model = model;
        //this.show();
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
    invalidate () {

    }

    getFullIO () {
        if (this.parent && this.IO) {
            return this.parent.getFullIo() + "_" + this.IO;
        }
        else if (this.parent) {
            return this.parent.getFullIo();
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