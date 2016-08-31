/**
 * Created by alexey2baranov on 8/30/16.
 */

let Zemla= require("../model/Zemla");
let $= require("jquery");
let AbstractView= require("./AbstractView");

class ZemlaAsListView extends AbstractView{
    getHTML(){
        return require("./tmpl/js/ZemlaAsListView").render(this, {
            KopaAsListItemView: require("./tmpl/js/KopaAsListItemView")
        });
    }
}

module.exports=ZemlaAsListView;