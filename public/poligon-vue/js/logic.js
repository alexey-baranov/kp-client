/**
 * Created by alexey2baranov on 9/25/16.
 */
"use strict";

require("../../../src/bootstrap");
let Vue = require("vue");
let $ = require("jquery");
let models = require("../../../src/model");
let WAMPFactory = require("../../../src/WAMPFactory");

global.log4javascript.getRootLogger().debug("starting...");
let WAMP = WAMPFactory.getWAMP();

let SlovoAsListItemView= require("./../../../src/view/slovo-as-list-item.vue");
let KopaView= require("./../../../src/view/kopa.vue");

WAMP.onopen = async function (session) {
    console.log('opened');
    session.prefix('api', 'ru.kopa');
    window.zemla = await models.Zemla.get(2);

    window.kopnik1 = await models.Kopnik.get(1);
    window.kopnik2 = await models.Kopnik.get(2);
    window.kopnik3 = await models.Kopnik.get(3);

    zemla.obshina = [kopnik2, kopnik3];

    window.slovo= await models.Slovo.get(1);

/*    const slovoAsListItemView= new Vue(Object.assign(SlovoAsListItemView,
        {propsData: {
            model: slovo
        }}));*/
    // slovoAsListItemView.$mount("#slovo");

    window.kopa= await models.Kopa.get(3);

    const kopaView= new Vue(Object.assign(KopaView,
        {propsData: {
            model: kopa,
            id:"default"
        }}));
    kopaView.$mount("#kopa");

    setTimeout(function(){
        kopa.loadDialog();
    },3000);
};
WAMP.open();
