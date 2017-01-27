/**
 * Created by alexey2baranov on 9/25/16.
 */

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandel rejection in promise. Reason: ' + JSON.stringify(reason), JSON.stringify(promise));
});

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import $ from "jquery"
import Vue from 'vue'
let VueRouter = require('vue-router');

import Application from './Application'
import applicationView from './view/application.vue'
let models = window.models= require("./model")

let application= window.application= Application.getInstance()
application.state= Application.State.Auth


// let applicationView= window.applicationView= new applicationView()
applicationView.data={
  id: "a",
  model: application
}
applicationView.el="#application"

window.applicationView = new Vue(applicationView)
let x=1;

/*

WAMP.onopen = async function (session) {
  console.log("opened")

  return

  session.prefix('api', 'ru.kopa');

  Vue.use(VueRouter);

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
};
WAMP.open();
*/

/*
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})
*/
