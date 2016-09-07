/**
 * Created by alexey2baranov on 8/30/16.
 */

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

        this.rodinasViews = [];

        for (var rodina = Application.kopnik.rodina; rodina; rodina = rodina.parent) {
            this.rodinasViews.unshift(new ZemlaAsPathView(rodina, this, "path_" + rodina.id));
        }
    }

    setModel(value) {
        super.setModel(value);
        let model = this.model;

        this.onHelper(Page.event.rodinaChanged, this.onRodinaChanged, this);
        this.onHelper(Page.event.kopaChanged, this.onKopaChanged, this);

        this.rodinaView = new ZemlaAsListView(model.rodina, this, "rodina");
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

        for(let eachRodinaView of this.rodinasViews){
            eachRodinaView.attach();
        }

        if (model.kopa){
            this.kopaView.attach();
        }
        else{
            this.rodinaView.attach();
        }
    }

    invalidate() {
        this.get$().replace(`#${this.io}`);
    }

    onKopaChanged() {

    }

    onRodinaChanged() {

    }
}


module.exports=PageView;
