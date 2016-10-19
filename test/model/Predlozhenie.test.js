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
    KOPNIK2 = 2,
    KOPNIK3 = 3,
    ZEMLA = 2,
    ZEMLA2 = 2,
    ZEMLA3 = 3,
    KOPA = 3,
    PREDLOZHENIE = 1,
    predlozhenie;

let WAMP = WAMPFactory.getWAMP();

describe('Predlozhenie', function () {
    before(function (done) {
        models.RemoteModel.clearCache();
        WAMP.onopen = function (session, details) {
            session.prefix('api', 'ru.kopa');
            done();
        };
        WAMP.open();
    });

    after(function () {
        // return require("../UnitTestTempDataCleaner").clean("Predlozhenie");
    });

    after(function (done) {
        WAMP.onclose = function (session, details) {
            done();
        };
        WAMP.close();
    });


    describe("#za, #protiv", function () {
        let somePredlozhenie = new models.Predlozhenie();

        it('should be undefined', async function () {
            assert.equal(somePredlozhenie.za, undefined, "someKopnik.za, undefined");
            assert.equal(somePredlozhenie.protiv, undefined, "someKopnik.protiv, undefined");
        });
        it('should be one Golos', async function () {
            somePredlozhenie.golosa = [{value: 1}, {value: -1}];
            assert.equal(somePredlozhenie.za.length, 1, "");
            assert.equal(somePredlozhenie.protiv.length, 1, "");
        });
    });

    describe('#create()', async function () {
        let predlozhenie,
            predlozhenieValue = `temp predlozhenie` + new Date().getTime();

        it('должен опубликовать "kopa.id3.predlozhenieAdd"', async function (done) {
            try {
                let kopnik = models.Kopnik.getReference(KOPNIK);
                let kopa = await models.Kopa.get(KOPA);

                await WAMP.session.subscribe(`api:model.Kopa.id${KOPA}.predlozhenieAdd`, async function (args) {
                    try {
                        predlozhenie = await models.Predlozhenie.get(args[0]);
                        assert.equal(predlozhenie.author.id, KOPNIK2, "predlozhenie.author.id, KOPNIK2");
                        done();
                    }
                    catch (err) {
                        done(err);
                    }
                });

                predlozhenie = await models.Predlozhenie.create({
                    place: kopa,
                    value: predlozhenieValue,
                    author: kopnik,
                });
            }
            catch (err) {
                done(err);
            }
        });
    });

    describe('getGolosa', async function () {
        let predlozhenie;

        it('Golos.create() -> Predlozhenie.emit(addGolos)', async function () {
            predlozhenie = await models.Predlozhenie.get(PREDLOZHENIE);
            await predlozhenie.reloadGolosa();
            assert.equal(_.isArray(predlozhenie.golosa), true, "_.isArray(predlozhenie.golosa)");
            assert.equal(predlozhenie.golosa.length > 0, true, "typeof predlozhenie.golosa.length>0");
            assert.equal(predlozhenie.golosa[0] instanceof models.Golos, true, "");
        });
    });
});