/**
 * Created by alexey2baranov on 8/30/16.
 */

let Zemla = require("../model/Zemla");
let $ = require("jquery");
let AbstractView = require("./AbstractView");
let KopaAsListItemView = require("./KopaAsListItemView");

class ZemlaAsListView extends AbstractView {
    setModel(value) {
        if (this.model){
            this.model.removeListener(Zemla.event.kopasReloaded, this.onModelKopasReloadedWrapper);
        }

        if (this.kopasViews){
            for(let eachKopaView of this.kopasViews){
                eachKopaView.setModel(null);
            }
        }

        super.setModel(value);
        let model = value;

        if (model.kopas) {
            this.kopasViews = model.kopas.map(eachKopa=>new KopaAsListItemView(eachKopa, this, "kopas_" + eachKopa.id));
        }
        else {
            this.kopasViews = undefined;
        }
        this.onModelKopasReloadedWrapper= model.onHelper(Zemla.event.kopasReloaded, this.onModelKopasReloaded, this);
    }

    getHTML() {
        return require("./tmpl/js/ZemlaAsListView").render(this, {
            KopaAsListItemView: require("./tmpl/js/KopaAsListItemView")
        });
    }

    onModelKopasReloaded() {
        let model = this.model;

        this.kopasViews = [];
        for (let eachKopa of model.kopas) {
            let eachKopaView = new KopaAsListItemView(eachKopa, this, "kopa_"+eachKopa.id);
            this.kopasViews.push(eachKopaView);

            eachKopaView.get$().appendTo(`#${this.io}`);
            eachKopaView.attach();
        }
    }

    attach() {
        let model = this.model;
        if (!model.kopasViews) {
            model.reloadKopas();
        }
    }
}

ZemlaAsListView.KOPAS_BUNDLE_SISE = 10;


module.exports = ZemlaAsListView;