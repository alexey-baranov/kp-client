/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict";

require("../../src/bootstrap");
var assert = require('chai').assert;
var models = require("../../src/model");
let _ = require("lodash");
let WAMPFactory = require("../../src/WAMPFactory");

let window,
    KOPNIK2 = 2;
let KOPNIK3 = 3;
let ZEMLA2 = 2;
let ZEMLA3 = 3,

    SLOVO = 1;
let model,
    view;

let WAMP = WAMPFactory.getWAMP();

describe('SlovoAsListItemView', function () {

    before(function () {
        return new Promise(function (res, rej) {
            WAMP.onopen = function (session, details) {
                session.prefix('api', 'ru.kopa');
                res();
            };
            WAMP.open();
        });
    });


    after(function () {
        return new Promise(function (res, rej) {
            WAMP.onclose = function (session, details) {
                res();
            };
            WAMP.close();
        });
    });

    it('should done', async function () {
        return 2;
    });

    it('should make view', async function () {
        model = await models.Slovo.get(SLOVO);
        view = new window.bundle.views.SlovoAsListItemView(model, null, "unitTest");
    });

    it('should append view to body', function () {
        view.$.append(window.document.body);
    });

    it('should invalidate on model change', async function (done) {
        try {
            model.on("change", ()=> {
                try {
                    assert.equal(window.bundle.$(`#${view.io}_value`).text(), model.value);
                    done();
                }
                catch (err) {
                    done(err);
                }
            });
            model.value = "Я ЗА! " + new Date();
            await model.save();
        }
        catch (err) {
            console.error(err);
        }
    });

    it('should delete all listeners after setModel(null)', function () {
        modelView.setModel(null);
        assert.equal(model.listenerCount(), 0);
    });
});