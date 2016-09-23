/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict";

var assert = require('chai').assert;
var models = require("../../src/model");
require("../../src/bootstrap");
let _ = require("lodash");
let WAMPFactory = require("../../src/WAMPFactory");

let KOPNIK = 2,
    ZEMLA = 2,
    KOPA= 3;

let WAMP = WAMPFactory.getWAMP();

describe('Kopa', function () {
    before(function () {
        models.RemoteModel.clearCache();
        return new Promise(function (res, rej) {
            WAMP.onopen = function (session, details) {
                session.prefix('api', 'ru.kopa');
                res();
            };
            WAMP.open();
        });
    });

    after(function () {
        // return require("../UnitTestTempDataCleaner").clean("Slovo");
    });

    after(function () {
        return new Promise(function (res, rej) {
            WAMP.onclose = function (session, details) {
                res();
            };
            WAMP.close();
        });
    });

    let kopa = null;

    describe('#getReference()', function () {
        it("should return Kopa", function () {
            kopa = models.Kopa.getReference(KOPA);
            assert.equal(kopa instanceof models.Kopa, true);
        });
    });

    describe('#get()', function () {
        it('should return loaded Kopa', async function () {
                kopa = await models.Kopa.get(KOPA);
                assert.equal(kopa instanceof models.Kopa, true);
                assert.equal(kopa._isLoaded, true);
                assert.equal(_.isArray(kopa.attachments), true);
        });
    });

    describe('events', async function () {
        let kopnik,
            kopa;

        it('Slovo.create() -> Kopa.emit(addSlovo)', async function (done) {
            try {
                kopnik = await models.Kopnik.get(KOPNIK);
                kopa = await models.Kopa.get(KOPA);

                kopa.dialog=[];
                kopa.on(models.Kopa.event.slovoAdd, (sender, add)=> {
                    try {
                        assert.equal(add instanceof models.Slovo, true, "add instanceof models.Slovo");
                        assert.equal(sender.dialog[0], add, "sender.dialog[0], add");
                        done();
                    }
                    catch (err) {
                        done(err);
                    }
                });

                let value = "some Slovo temp "+new Date().getTime();
                let slovo = await models.Slovo.create({
                    value: value,
                    place: kopa,
                    owner: kopnik,
                });
            }
            catch (err) {
                done(err);
            }
        });

        it('Predlozhenie.create() -> Kopa.emit(addPredlozhenie)', async function (done) {
            try {
                kopnik = await models.Kopnik.get(KOPNIK);
                kopa = await models.Kopa.get(KOPA);

                kopa.result=[];
                kopa.on(models.Kopa.event.predlozhenieAdd, (sender, add)=> {
                    try {
                        assert.equal(add instanceof models.Predlozhenie, true, "add instanceof models.Predlozhenie");
                        assert.equal(sender.result[0], add, "sender.result[0], add");
                        done();
                    }
                    catch (err) {
                        done(err);
                    }
                });

                let value = "some Predlozhenie temp "+new Date().getTime();
                let predlozhenie = await models.Predlozhenie.create({
                    value: value,
                    place: kopa,
                    initiator: kopnik,
                });
            }
            catch (err) {
                done(err);
            }
        });
    });
});