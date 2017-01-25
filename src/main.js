// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

let $= require("jquery");
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandel rejection in promise. Reason: ' + JSON.stringify(reason), JSON.stringify(promise));
});

/**
 * Created by alexey2baranov on 9/25/16.
 */
"use strict";

require("./bootstrap");
let VueRouter = require('vue-router');
let models = window.models= require("./model");
let WAMPFactory = require("./WAMPFactory");

global.log4javascript.getRootLogger().debug("starting...");
let WAMP = WAMPFactory.getWAMP();

let SlovoAsListItemView = require("./view/slovo-as-list-item.vue");
let KopaView = require("./view/kopa.vue");

WAMP.onopen = async function (session) {
  session.prefix('api', 'ru.kopa');

  Vue.use(VueRouter);

  const router = new VueRouter({
    mode: 'history',
    base: "public/poligonvue",
    routes: [
      {
        path: '/zemla/:ZEMLA',
        name: "zemla",
        component: require("./view/zemla.vue"),
      },
      {
        path: '/kopa/:KOPA',
        name: "kopa",
        component: require("./view/kopa.vue")
      },
      {
        path: '/kopnik/:KOPNIK',
        name: "kopnik",
        component: require("./view/kopnik.vue")
      },
      {
        path: '/',
        beforeEnter: async (to, from, next) => {
          await kopnik.loaded();
          // next({name:"zemla", params:{ZEMLA:kopnik.dom.id}})
          next({name:"kopnik", params:{KOPNIK:kopnik.id}})
        }
      },
    ]
  });

  const component = require("./view/application.vue");
  var kopnik = window.kopnik= models.Kopnik.current= models.Kopnik.getReference(2);
  window.predlozhenie= models.Predlozhenie.getReference(1);

  const view = new Vue(Object.assign(component,
    {
      data: {
        model: {
          kopnik: kopnik
        }
      },
      propsData: {},
      router
    })).$mount("#kopa");

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



/*
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})
*/
