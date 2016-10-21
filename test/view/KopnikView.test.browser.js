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
let VueRouter= require("vue-router");
let $ = require("jquery");

let window,
    KOPNIK2 = 2;
let KOPNIK3 = 3;
let ZEMLA2 = 2;
let ZEMLA3 = 3,

    ZEMLA = 1;
let model,
    view;

let WAMP = WAMPFactory.getWAMP();
Vue.use(VueRouter);

describe('KopnikView', function () {
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

    it('should $mount view', async function () {
        model = await models.Kopnik.get(KOPNIK2);
        view = new Vue(Object.assign(require("../../src/view/kopnik.vue"),
            {
                propsData: {
                    model: model,
                    id: "default"
                },
                router: new VueRouter(),
            }));
        view.$mount();
    });
});