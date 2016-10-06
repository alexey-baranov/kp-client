/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict";

require("../../src/bootstrap");
var assert = require('chai').assert;
var models = require("../../src/model");
let _ = require("lodash");
let WAMPFactory = require("../../src/WAMPFactory");
let Vue = require("vue");
let VueRouter = require('vue-router');
let $ = require("jquery");

let window,
    KOPNIK2 = 2;
let KOPNIK3 = 3;
let ZEMLA2 = 2;
let ZEMLA3 = 3,

    MODEL = 1;
let model,
    view;

Vue.use(VueRouter);
let WAMP = WAMPFactory.getWAMP();

describe('SidePanelView', function () {
    let model;

    before(function (done) {
        WAMP.onopen = function (session, details) {
            session.prefix('api', 'ru.kopa');
            done();
        };
        WAMP.open();
    });


    after(function (done) {
        WAMP.onclose = function (session, details) {
            done();
        };
        WAMP.close();
    });

    it('should $mount view async', function (done) {
        (async function(){
            const kopnik1 = await models.Kopnik.get(1);

            view = new Vue(Object.assign(require("../../src/view/side-panel.vue"),
                {
                    propsData: {
                        kopnik: kopnik1,
                        id: "default"
                    },
                    router: new VueRouter()
                }));
            view.$mount();

            const Rus= models.Zemla.getReference(1);
            Rus.on(models.RemoteModel.event.change, ()=>{
                try {
                    assert.equal(view.$el.innerHTML.indexOf("Сургут") >= 0, true);
                    done();
                }
                catch(err){
                    done(err);
                }
            });
        })();
    });
});