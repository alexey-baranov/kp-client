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

        this.ownView = undefined;
        this.kopaView = undefined;

        this.ownsViews = [];

        for (var eachOwn = Application.kopnik.own; eachOwn; eachOwn = eachOwn.parent) {
            this.ownsViews.unshift(new ZemlaAsPathView(eachOwn, this, "path_" + eachOwn.id));
        }
    }

    setModel(value) {
        super.setModel(value);
        let model = this.model;

        this.onHelper(Page.event.ownChanged, this.onOwnChanged, this);
        this.onHelper(Page.event.kopaChanged, this.onKopaChanged, this);

        this.ownView = new ZemlaAsListView(model.own, this, "own");
        this.kopaView = new KopaView(model.kopa, this, "kopa");
    }

    getHTML() {
        return require("./tmpl/js/PageView").render(this, {
            KopaView: require("./tmpl/js/KopaView"),
            ZemlaAsListView: require("./tmpl/js/ZemlaAsListView")
        });
    }

    invalidate() {
        this.get$().replace(`#${this.io}`);
    }

    onKopaChanged() {

    }

    onOwnChanged() {

    }
}


module.exports=PageView;
