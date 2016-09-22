/**
 * Created by alexey2baranov on 8/30/16.
 */
"use strict";

let Zemla= require("../model/Zemla");
let $= require("jquery");
let AbstractView= require("./AbstractView");

class KopaAsListItemView extends AbstractView{
    getHTML(){
        return require("./tmpl/js/KopaAsListItemView").render(this, {
        });
    }
}

module.exports=KopaAsListItemView;