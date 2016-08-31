/**
 * Created by alexey2baranov on 8/25/16.
 */
let AbstractView= require("./AbstractView");
let Kopnik= require("../model/Kopnik");
let $= require("jquery");
// let ZemlaView= require("./ZemlaView");

/**
 *
 * @param  model
 * @param {AbstractView} parent
 * @param {string} io
 * @constructor
 */
class KopnikView extends AbstractView{
    constructor(model, parent, IO){
        super(model, parent, IO);
    }

    setModel(model) {
        super.setModel(model);

        model.on(Kopnik.event.change, ()=>this.invalidate());

        if (model.rodina){
            this.zemlaView= new ZemlaView(model.rodina, this, "zemla");
        }
        else{
            this.zemlaView= null;
        }
        return this;
    }

    getHTML(){
        let result= require("./tmpl/js/KopnikView").render(this,{
            "ZemlaView":require("./tmpl/js/ZemlaView")
        });
        return result;
    }

    attach(){
        this.$fullName= $(`#${this.io}_fullName`);
        this.$birth= $(`#${this.io}_birth`);
        this.$email= $(`#${this.io}_email`);
        this.$reload= $(`#${this.io}_reload`).click(()=>{
            this.model.reload();
        });
        if (this.zemlaView) {
            this.zemlaView.attach();
        }
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