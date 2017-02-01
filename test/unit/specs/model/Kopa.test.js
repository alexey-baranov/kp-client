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
    KOPA = 3;

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
        })
            .then((q)=> {
                return WAMP.session.call("ru.kopa.unitTest.cleanTempData", ['Slovo', "Predlozhenie"]);
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
            assert.equal(kopa instanceof models.Kopa, true, "kopa instanceof models.Kopa");
            assert.equal(kopa.place instanceof models.Zemla, true);
            assert.equal(kopa._isLoaded, true);
            assert.equal(_.isArray(kopa.attachments), true);
        });
    });

    describe('#create()', async function () {
        let kopaQuestion = "temp some Kopa";

        it('должен опубликовать "zemla.id2.kopaAddy"', async function (done) {
            try {
                let kopnik = models.Kopnik.getReference(KOPNIK);
                let zemla = await models.Zemla.get(ZEMLA);
                let kopa;

                await WAMP.session.subscribe(`api:model.Zemla.id${ZEMLA}.kopaAdd`, async function (args) {
                    try{
                        kopa= await models.Kopa.get(args[0]);
                        assert.equal(kopa.inviter.id, KOPNIK, "kopa.inviter.id, KOPNIK2");
                        done();
                    }
                    catch(err){
                        done(err);
                    }
                });

                kopa = await models.Kopa.create({
                    place: zemla,
                    question: kopaQuestion,
                    inviter: kopnik,
                });
                kopa.invite();
            }
            catch (err) {
                done(err);
            }
        });
    });    

    describe('#loadDialog()', function () {
        let result,
            kopa;

        it("should return array of Slovo", async function () {
            kopa = await models.Kopa.get(KOPA);
            result = await kopa.loadDialog();

            assert.equal(_.isArray(result), true);
            for (var eachResult of result) {
                assert.equal(eachResult instanceof models.Slovo, true);
            }
        });

        it('size should be 3', function () {
            assert.equal(result.length, 3, "result.length, 3");
        });

        it('should be ordered by created', function () {
            assert.equal(result[0].created < result[1].created, true);
            assert.equal(result[1].created < result[2].created, true);
        });

        it("should prepend +1 Slovo", async function () {
            kopa.dialog.shift();
            result = await kopa.loadDialog();
            assert.equal(result.length, 3, "result.length, 3");
        });

        it('should prepend to begining', function () {
            assert.equal(result[0].created < result[1].created, true);
            assert.equal(result[1].created < result[2].created, true);
        });
    });

    describe('#loadResult()', function () {
        let result,
            kopa;

        it("should return array of Predlozheniex", async function () {
            kopa = await models.Kopa.get(KOPA);
            result = await kopa.loadResult();

            assert.equal(_.isArray(result), true);
            for (var eachResult of result) {
                assert.equal(eachResult instanceof models.Predlozhenie, true);
            }
        });

        it('size should be 3', function () {
            assert.equal(result.length, 3, "result.length, 3");
        });

        it('should be ordered by created', function () {
            assert.equal(result[0].created < result[1].created, true);
            assert.equal(result[1].created < result[2].created, true);
        });

        it("should prepend +1 Predlozhenie", async function () {
            kopa.result.shift();
            result = await kopa.loadResult();
            assert.equal(result.length, 3, "result.length, 3");
        });

        it('should prepend to begining', function () {
            assert.equal(result[0].created < result[1].created, true);
            assert.equal(result[1].created < result[2].created, true);
        });
    });

    describe('events', async function () {
        let kopnik,
            kopa;

        it('Slovo.create() -> Kopa.emit(addSlovo)', async function (done) {
            try {
                kopnik = await models.Kopnik.get(KOPNIK);
                kopa = await models.Kopa.get(KOPA);

                kopa.dialog = [];
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

                let value = "temp "+new Date().getTime();
                let slovo = await models.Slovo.create({
                    place: kopa,
                    value: value,
                    owner: kopnik,
                });
            }
            catch (err) {
                done(err);
            }
        });

        it('Predlozhenie.create() z-> Kopa.emit(addPredlozhenie)', async function (done) {
            try {
                kopnik = await models.Kopnik.get(KOPNIK);
                kopa = await models.Kopa.get(KOPA);

                kopa.result = [];
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

                let value = "temp "+new Date().getTime();
                let predlozhenie = await models.Predlozhenie.create({
                    place: kopa,
                    value: value,
                    author: kopnik,
                });
            }
            catch (err) {
                done(err);
            }
        });
    });
});