/**
 * Created by alexey2baranov on 9/25/16.
 */
"use strict";

require("../../../src/bootstrap");
let Vue = require("vue");
let VueRouter = require('vue-router');
let $ = require("jquery");
let models = require("../../../src/model");
let WAMPFactory = require("../../../src/WAMPFactory");

global.log4javascript.getRootLogger().debug("starting...");
let WAMP = WAMPFactory.getWAMP();

let SlovoAsListItemView = require("./../../../src/view/slovo-as-list-item.vue");
let KopaView = require("./../../../src/view/kopa.vue");

WAMP.onopen = async function (session) {
    console.log('opened');
    session.prefix('api', 'ru.kopa');

    Vue.use(VueRouter);

    const router = new VueRouter({
        mode: 'history',
        routes: [
            {
                path: '/public/poligon-vue/zemla/:ZEMLA',
                name: "zemla",
                component: require("./../../../src/view/zemla.vue")
            },
            {
                path: '/public/poligon-vue/zemla/:ZEMLA/kopa/:KOPA',
                name: "kopa",
                component: require("./../../../src/view/kopa.vue")
            },
            {
                path: '',
                component: require("./../../../src/view/kopa.vue")
            },
        ]
    });


    const component = require("./../../../src/view/application.vue");
    const view = new Vue(Object.assign(component,
        {
            data: {
                model: {
                    kopnik: models.Kopnik.getReference(2)
                }
            },
            propsData: {},
            router
        })).$mount("#kopa");

    console.log("done");

    /*    new Vue({
     el: "#kopa",
     propsData: {
     kopnik: kopnik1
     },
     render: h => h(component)
     });*/

    /*
     window.slovo= await models.Slovo.get(1);

     const slovoAsListItemView= new Vue(Object.assign(SlovoAsListItemView,
     {propsData: {
     model: slovo
     }}));*/
    // slovoAsListItemView.$mount("#slovo");

    /*    window.kopa= await models.Kopa.get(3);

     window.kopaView= new Vue(Object.assign(KopaView,
     {propsData: {
     model: kopa,
     id:"default"
     }}));
     kopaView.$mount("#kopa");

     setTimeout(function(){
     kopa.loadDialog();
     },3000);*/
};
WAMP.open();
