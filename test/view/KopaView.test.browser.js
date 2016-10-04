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
let $ = require("jquery");

let window,
    KOPNIK2 = 2;
let KOPNIK3 = 3;
let ZEMLA2 = 2;
let ZEMLA3 = 3,

    KOPA = 1;
let model,
    view;

let WAMP = WAMPFactory.getWAMP();

describe('KopaView', function () {
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
        model = await models.Kopa.get(KOPA);
        view = new Vue(Object.assign(require("../../src/view/kopa.vue"),
            {
                propsData: {
                    model: model,
                    id: "default"
                }
            }));
        view.$mount();
    });

    it('should invalidate on model change', function (done) {
        (async function () {
            model.on("change", ()=> {
                try {
                    assert.equal($(".note", view.$el).text(), model.note);
                    done();
                }
                catch (err) {
                    done(err);
                }
            });
            model.note = new Date().toString();
            await model.save();
        })();
    });
});