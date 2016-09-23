/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict";

var assert = require('chai').assert;
var models = require("../../src/model");
require("../../src/bootstrap");
let _ = require("lodash");
let WAMPFactory = require("../../src/WAMPFactory");

let KOPNIK2 = 2;
let KOPNIK3 = 3;
let KOPNIK4 = 4;
let ZEMLA2 = 2;
let ZEMLA3 = 3;
let KOPA = 3;


let WAMP = WAMPFactory.getWAMP();

describe('Kopnik', function () {
    before(function () {
        models.RemoteModel.clearCache();
        return new Promise(function (res, rej) {
            WAMP.onopen = function (session, details) {
                session.prefix('api', 'ru.kopa');
                res();
            };
            WAMP.open();
        })
            .then(function () {
                return WAMP.session.call("ru.kopa.unitTest.cleanTempData", ['Kopnik']);
            });
            // .catch(err=>console.log);
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

    describe("#get()", function () {
        it('#dom should be instance of Zemla', async function () {
            let kopnik2= await models.Kopnik.get(KOPNIK2);
            assert.equal(kopnik2.dom instanceof models.Zemla, true);
        });
    });

    describe("#setStarshina()", function () {
        let someKopnik1,
            someKopnik2,
            kopnik2;
        /**
         * создаю два копника один старшина другому на втором
         */
        it('should emit voiskoChange twice', async function (done) {
            try {
                let eventCount = 0;
                kopnik2 = await models.Kopnik.get(KOPNIK2);
                let listener;

                kopnik2.on(models.Kopnik.event.voiskoChange, listener = async()=> {
                    try {
                        eventCount++;

                        if (eventCount == 1 && kopnik2.voiskoSize != 2) {
                            kopnik2.removeListener(models.Kopnik.event.voiskoChange, listener);
                            done(new Error("kopnik2.voiskoSize!=2"));
                        }

                        if (eventCount == 2 && kopnik2.voiskoSize != 3) {
                            kopnik2.removeListener(models.Kopnik.event.voiskoChange, listener);
                            done(new Error("kopnik2.voiskoSize!=3"));
                        }
                        if (eventCount == 2) {
                            kopnik2.removeListener(models.Kopnik.event.voiskoChange, listener);
                            assert.equal(someKopnik2.starshina, someKopnik1, "someKopnik2.starshina, someKopnik1");
                            assert.equal(someKopnik2.starshina.starshina, kopnik2, "someKopnik2.starshina.starshina, kopnik2");
                            done();
                        }
                    } catch (err) {
                        done(err);
                    }
                });

                someKopnik1 = await models.Kopnik.create({
                    name: "temp",
                    surname: "temp",
                    patronymic: "temp",
                    birth: 1900,
                    dom: models.Zemla.getReference(ZEMLA2),
                });
                await someKopnik1.setStarshina(models.Kopnik.getReference(KOPNIK2));


                someKopnik2 = await models.Kopnik.create({
                    name: "temp",
                    surname: "temp",
                    patronymic: "temp",
                    birth: 1900,
                    dom: models.Zemla.getReference(ZEMLA2),
                });
                await someKopnik2.setStarshina(someKopnik1);
            }
            catch (err) {
                done(err);
            }
        });

        /**
         * перекидываю копника с дружинником на четвертого
         * сначала прилетают события открепления дружины
         * потом прикрепления
         */
        it('should emit voiskoChange down and up, emit starshina changed', async function (done) {
            try {
                let kopnik4 = await models.Kopnik.get(KOPNIK4);

                /**
                 * сначала прилетают события открепления дружины
                 * потом прикрепления,
                 * потом события о смене старшины от голосы к хвосту
                 */
                kopnik2.once(models.Kopnik.event.voiskoChange, ()=> {
                    try {
                        assert.equal(kopnik2.voiskoSize, 1, "kopnik2.voiskoSize, 1");
                        kopnik4.once(models.Kopnik.event.voiskoChange, ()=> {
                            try {
                                assert.equal(kopnik4.voiskoSize, 2, "kopnik4.voiskoSize, 2");
                                assert.equal(someKopnik1.starshina, kopnik4, "someKopnik1.starshina, kopnik4");
                                someKopnik2.once(models.Kopnik.event.starshinaChange, async()=> {
                                    try {
                                        await someKopnik2.reload();
                                        assert.equal(someKopnik2.starshina, someKopnik1, "someKopnik2.starshina, someKopnik1");
                                        await someKopnik2.starshina.reload();
                                        assert.equal(someKopnik2.starshina.starshina, kopnik4, "someKopnik2.starshina.starshina, kopnik4");
                                        done();
                                    } catch (err) {
                                        done(err);
                                    }
                                });
                            }
                            catch (err) {
                                done(err);
                            }
                        });
                    }
                    catch (err) {
                        done(err);
                    }
                });
                someKopnik1.setStarshina(models.Kopnik.getReference(KOPNIK4));
            }
            catch (err) {
                done(err);
            }
        });
    });


});