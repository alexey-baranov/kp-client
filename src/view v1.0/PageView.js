/**
 * Created by alexey2baranov on 8/30/16.
 */
"use strict";

let Page = require("../Page");
let $ = require("jquery");
let AbstractView = require("./AbstractView");
let ZemlaAsListView = require("./ZemlaAsListView");
let KopaView = require("./KopaView");
let Application = require("../Application");
let ZemlaAsPathView = require("./ZemlaAsPathView");

class PageView extends AbstractView {
    constructor(model, parent, IO) {
        super(model, parent, IO);

        this.domsViews = [];

        for (var dom = Application.kopnik.dom; dom; dom = dom.parent) {
            this.domsViews.unshift(new ZemlaAsPathView(dom, this, "path_" + dom.id));
        }
    }

    setModel(value) {
        super.setModel(value);
        let model = this.model;

        this.setModelListener(Page.event.domChanged, this.onDomChanged, this);
        this.setModelListener(Page.event.kopaChanged, this.onKopaChanged, this);

        this.domView = new ZemlaAsListView(model.dom, this, "dom");
        this.kopaView = new KopaView(model.kopa, this, "kopa");
    }

    getHTML() {
        return require("./tmpl/js/PageView").render(this, {
            KopaView: require("./tmpl/js/KopaView"),
            ZemlaAsListView: require("./tmpl/js/ZemlaAsListView")
        });
    }

    attach(){
        let model= this.model;

        for(let eachDomView of this.domsViews){
            eachDomView.attach();
        }

        if (model.kopa){
            this.kopaView.attach();
        }
        else{
            this.domView.attach();
        }
    }

    invalidate() {
        this.get$().replace(`#${this.io}`);
    }

    onKopaChanged() {

    }

    onDomChanged() {

    }
}


module.exports=PageView;
