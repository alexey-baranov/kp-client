/**
 * Created by alexey2baranov on 8/20/16.
 */
"use strict";

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandel rejection in promise. Reason: ' + JSON.stringify(reason), JSON.stringify(promise));
});

let autobahn = require('autobahn');
let config = require("./../cfg/main")["local-db"];
let Core= require("./Core");
let model= require("./model" );
let KopnikView= require("./view/KopnikView");
let ZemlaView= require("./view/ZemlaView");
let $= require("jquery");
require("./bootstrap");

let log= global.log4javascript.getLogger("indexjs");



let WAMP = new autobahn.Connection({
    url: `${config.WAMP.schema}://${config.WAMP.host}:${config.WAMP.port}/${config.WAMP.path}`,
    realm: "kopa",
    authmethods: ['ticket'],
    authid: "alexey_baranov@inbox.ru",
    onchallenge: function (session, method, extra) {
        return "alexey_baranov@inbox.ru";
    },
    use_es6_promises: true,
    max_retries: -1,
    max_retry_delay: 5
});
Core.setWAMP(WAMP);

WAMP.onopen= async function(session, details){
    console.log("connection opened");
    let alexey2baranov= model.Kopnik.getReference(1);
    let view= new KopnikView(alexey2baranov, null, "kopnik");
    let HTML= view.getHTML();

    view.get$().appendTo(document.body);
    view.attach();

    let podezd= model.Zemla.getReference(6);
    let podezdView= new ZemlaView(podezd,null, "podezd");
    podezdView.get$().appendTo(document.body);
    podezdView.attach();

    await alexey2baranov.reload();
    console.log('kopnik reloaded!!!', alexey2baranov.name, alexey2baranov.email, alexey2baranov);

    await podezd.reload();
    console.log('podezd reloaded!!!', podezd.name);
};
WAMP.open();

log.debug(123);
/*
console.log(Handlebars.templates.Kopnik({
    getFullIO: function(){return "very_long_html_id"},
    model:{name:"baranov"}
}));
*/
