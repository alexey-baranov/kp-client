/**
 * Created by alexey2baranov on 8/25/16.
 */
let AbstractView= require("./AbstractView");
let Zemla= require("../model/Zemla");
let Handlebars= require("handlebars");
require("../templates");
let $= require("jquery");

/**
 *
 * @param  model
 * @param {AbstractView} parent
 * @param {string} io
 * @constructor
 */
class ZemlaView extends AbstractView{
    setModel(model) {
        super.setModel(model);

        model.on(Zemla.event.change, ()=>this.invalidate());
        return this;
    }

    getHTML(){
        let result= Handlebars.templates.Zemla(this);
        return result;
    }

    attach(){
        this.$name= $(`#${this.io}_name`);
    }

    invalidate () {
        let model= this.model;

        this.$name.text(model.name);
    }
}

module.exports= ZemlaView;