/**
 * Created by alexey2baranov on 8/30/16.
 */
"use strict";

let Zemla= require("../model/Zemla");
let $= require("jquery");
let AbstractView= require("./AbstractView");
let Application= require("../Application");

class ZemlaAsPathView extends AbstractView{
    attach(){
        let model= this.model;

        $(`#${this.io}`).click(()=>{
            Application.page.setDom(model);
        });
    }
}

module.exports=ZemlaAsPathView;