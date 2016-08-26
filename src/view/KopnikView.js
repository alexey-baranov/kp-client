/**
 * Created by alexey2baranov on 8/25/16.
 */
let AbstractView= require("./AbstractView");
let Kopnik= require("../model/Kopnik");
let Handlebars= require("handlebars");
require("../templates");
let $= require("jquery");
let ZemlaView= require("./ZemlaView");

/**
 *
 * @param  model
 * @param {AbstractView} parent
 * @param {string} io
 * @constructor
 */
class KopnikView extends AbstractView{
    constructor(model, parent=null, IO=null){
        super(model, parent, IO);
        this.zemlaView= new ZemlaView();
    }

    setModel(model) {
        super.setModel(model);

        model.on(Kopnik.event.change, ()=>this.invalidate());
        return this;
    }

    getHTML(){
        let result= Handlebars.templates.Kopnik(this);
        return result;
    }

    attach(){
        this.$fullName= $(`#${this.io}_fullName`);
        this.$birth= $(`#${this.io}_birth`);
        this.$email= $(`#${this.io}_email`);
        this.$reload= $(`#${this.io}_reload`).click(()=>{
            this.model.reload();
        });
        this.zemlaView.attach();
    }

    onModelChange(){
        this.invalidate();
    }

    invalidate () {
        let model= this.model;
        this.$fullName.text(model.surname+" "+model.name+" "+model.patronymic);
        this.$birth.text(model.birth);
        this.$email.text(model.email)
    }


}

module.exports= KopnikView;