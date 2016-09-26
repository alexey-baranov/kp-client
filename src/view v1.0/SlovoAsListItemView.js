/**
 * Created by alexey2baranov on 8/30/16.
 */
"use strict";

let $= require("jquery");
let AbstractView= require("./AbstractView");

class SlovoAsListItemView extends AbstractView{
    setModelListeners(){
        super.setModelListeners();
        let model= this.model;
    }

    getHTML(){
        return require("./tmpl/js/SlovoAsListItemView").render(this, {
        });
    }
}

module.exports=SlovoAsListItemView;