/**
 * Created by alexey2baranov on 8/9/16.
 */
let pug = require("pug");

let alexey2baranov= {
    IO: "p_kopa_kopnik",
    id: 82,
    surname: "Баранов",
    name: "Алексей",
    patronymic: "Юрьевич",
    birth: 1983,
    email: "alexey_baranov@inbox.ru",
    words: [
        {id: 1, value: "hello"},
        {id: 2, value: "by"},
    ],
    zemla: {id: 6, name: "Сургут"},
    messages: [
        {id: 1, name: "lexey_baranov@inbox.ru"},
        {id: 2, name: "dlebars.registerPartial("},
        {id: 3, name: "ialzemla, Handleb"},
        {id: 4, name: "emplate = Handlebars.compile(KO"},
    ]
};

/*var output= pug.renderFile(__dirname+"/../public/poligon-pug/tmpl/Zemla.pug",{
    id:6, name:"Сургут"
});*/

// var  output= pug.renderFile(__dirname+"/../public/poligon-pug/tmpl/Kopnik.pug",alexey2baranov);
// var  output= pug.renderFile(__dirname+"/../public/poligon-pug/tmpl/Template.pug");

// var output = require("../public/poligon-pug/js/Kopnik")(alexey2baranov);
// var output = require("../public/poligon-pug/js/Template")();

function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    pug_mixins["Mixin"] = pug_interp = function () {
        var block = (this && this.block), attributes = (this && this.attributes) || {};
        pug_html = pug_html + "\u003Cdiv\u003Ethis is mixin\u003C\u002Fdiv\u003E";
    };
    pug_html = pug_html + "\u003Cdiv\u003Ethis is template";
    pug_mixins["Mixin"]();
    pug_html = pug_html + "\u003C\u002Fdiv\u003E";

    return pug_html;
}

console.log(template());
