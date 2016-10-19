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

    MODEL = 1;
let model,
    view;

let WAMP = WAMPFactory.getWAMP();

describe('AddressView', function () {
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
            const zemla3 = await models.Zemla.get(3);

            view = new Vue(Object.assign(require("../../src/view/address.vue"),
                {
                    propsData: {
                        dom: zemla3,
                        id: "default"
                    }
                }));
            view.$mount();

            const Rus= models.Zemla.getReference(1);

            Rus.on(models.RemoteModel.event.change, ()=>{
                try {
                    assert.equal(view.$el.innerHTML.indexOf("UnitTest2") >= 0, true);
                    done();
                }
                catch(err){
                    done(err);
                }
            });
        })();
    });
});