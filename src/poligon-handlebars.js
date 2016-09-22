/**
 * Created by alexey2baranov on 8/9/16.
 */
"use strict";

let fs = require("fs");
var Handlebars = require("handlebars");

// let KOPNIK_TEMPLATE = fs.readFileSync(__dirname + "/../public/poligon-handlebars/tmpl/Kopnik.handlebars", 'utf8');
let ZEMLA_TEMPLATE = fs.readFileSync(__dirname + "/../public/poligon-handlebars/tmpl/Zemla.handlebars", 'utf8');

// let kopnikTemplate = Handlebars.compile(KOPNIK_TEMPLATE);
// let zemlaTemplate = Handlebars.compile(ZEMLA_TEMPLATE);
// Handlebars.registerPartial("zemla", ZEMLA_TEMPLATE);


require("../src/templates");

Handlebars.registerPartial("zemla", Handlebars.templates.currentDom);
Handlebars.registerPartial("message", Handlebars.templates.message);
Handlebars.registerPartial("Node", Handlebars.templates.Node);
Handlebars.registerHelper("getIO", function(base, suffix){
    return base+"_"+suffix;
});


let zemlaView= Handlebars.templates.currentDom({id:6, name:"Сургут"});

console.log(Handlebars.templates.Node(
    {
    HTML_ID: "some_very_long_html_id",
    text: "parent node text",
    child:{
        text: "child text",
    }
}));

Handlebars.templates.kopnik({
    IO: "p_kopa_kopnik",
    id: 82,
    surname: "Баранов",
    name: "Алексей",
    patronymic: "Юрьевич",
    birth: 1983,
    email: "alexey_baranov@inbox.ru",
    words:[
        {id:1, value:"hello"},
        {id:2, value:"by"},
    ],
    currentDom:{id:6, name:"Сургут"},
    messages:[
        {id:1, name:"lexey_baranov@inbox.ru"},
        {id:2, name:"dlebars.registerPartial("},
        {id:3, name:"ialzemla, Handleb"},
        {id:4, name:"emplate = Handlebars.compile(KO"},
    ]
});
