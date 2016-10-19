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
            let kopnik2 = await models.Kopnik.get(KOPNIK2);
            assert.equal(kopnik2.dom instanceof models.Zemla, true);
        });
    });


    describe("#loadDruzhina()", function () {
        let kopnik2;

        /**
         * создаю предложение, голосую и жду когда выстрелит Predlozhenie#balanceChange
         */
        it('should load druzhina', async function () {
            kopnik2 = models.Kopnik.getReference(2);

            await kopnik2.loadDruzhina();
            assert.equal(_.isArray(kopnik2.druzhina), true, "_.isArray(kopnik2.druzhina)");
            assert.equal(kopnik2.druzhina.length, 2, "kopnik2.druzhina.size, 2");
            assert.equal(kopnik2.druzhina[0] instanceof models.Kopnik, true, "kopnik2.druzhina[0] instanceof models.Kopnik");
        });
    });

    describe("#setStarshina()", function () {
        let someKopnik1,
            someKopnik2,
            kopnik2,
            kopnik4;

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
                kopnik4 = await models.Kopnik.get(KOPNIK4);

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

        /**
         * ухожу новым копником из дружины
         */
        it('should reset starshina', function (done) {
            (async function (){
                try {
                    someKopnik1.setStarshina(null);
                    kopnik4.once(models.Kopnik.event.voiskoChange, ()=> {
                        try {
                            assert.equal(kopnik4.voiskoSize, 0, "kopnik4.voiskoSize, 0");
                            assert.equal(someKopnik1.starshina, null, "someKopnik1.starshina, null");
                            done();
                        }
                        catch (err) {
                            done(err);
                        }
                    });
                }
                catch (err) {
                    done(err);
                }
            })();
        });

        /**
         * создаю копника на втором и тут же снимаю
         */
        it('should emit druzhinaChange "add"', function (done) {
            (async function() {
                try {
                    kopnik2 = await models.Kopnik.get(KOPNIK2);
                    kopnik2.druzhina= [];
                    kopnik2.once(models.Kopnik.event.druzhinaChange,()=> {
                        try {
                            assert.equal(kopnik2.druzhina.indexOf(someKopnik1)>=0, true, "kopnik2.druzhina.indexOf(someKopnik1)>=0");
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
                    await someKopnik1.setStarshina(kopnik2);

                    await someKopnik1.setStarshina(null);
                    kopnik2.once(models.Kopnik.event.druzhinaChange,()=> {
                        try {
                            assert.equal(kopnik2.druzhina.length, 0, "kopnik2.druzhina.length, 0");
                            done();
                        } catch (err) {
                            done(err);
                        }
                    });

                }
                catch (err) {
                    done(err);
                }
            })();
        });
    });

    describe("#vote()", function () {
        let kopnik2,
            somePredlozhenie,
            kopa3;

        before(async function () {
            kopnik2 = await models.Kopnik.get(KOPNIK2);
            kopa3 = await models.Kopa.get(KOPA);

            somePredlozhenie = await models.Predlozhenie.create({
                place: kopa3,
                author: kopnik2,
                value: "temp " + new Date(),
                golosa: [],
                totalZa: 0,
                totalProtiv: 0,
            });
        });

        /**
         * создаю предложение, голосую и жду когда выстрелит Predlozhenie#balanceChange
         */
        it('should vote', function (done) {
            (async function () {
                try {
                    let listenverhfvxc,
                        eventNumber = -1;

                    somePredlozhenie.on(models.Predlozhenie.event.rebalance, function () {
                        try {
                            switch (eventNumber--) {
                                case -1:
                                    assert.equal(somePredlozhenie.totalZa, 2, "somePredlozhenie.totalZa, 2");
                                    assert.equal(somePredlozhenie.totalProtiv, 0, "somePredlozhenie.totalProtiv, 0");
                                    assert.equal(somePredlozhenie.golosa.length, 1, "somePredlozhenie.golosa.length, 1");
                                    assert.equal(somePredlozhenie.golosa[0] instanceof models.Golos, true, "somePredlozhenie.golosa[0] instanceof models.Golos, true");
                                    done();
                                    break;
                                case 0:
                                    assert.equal(somePredlozhenie.totalZa, 0, "somePredlozhenie.totalZa, 0");
                                    assert.equal(somePredlozhenie.totalProtiv, 0, "somePredlozhenie.totalProtiv, 0");
                                    assert.equal(somePredlozhenie.golosa.length, 0, "somePredlozhenie.golosa.length, 0");
                                    break;
                                case 1:
                                    assert.equal(somePredlozhenie.totalZa, 0, "somePredlozhenie.totalZa, 0");
                                    assert.equal(somePredlozhenie.totalProtiv, 2, "somePredlozhenie.totalProtiv, 2");
                                    assert.equal(somePredlozhenie.golosa.length, 1, "somePredlozhenie.golosa.length, 1");
                                    assert.equal(somePredlozhenie.golosa[0] instanceof models.Golos, true, "somePredlozhenie.golosa[0] instanceof models.Golos");

                                    break;
                            }
                        }
                        catch (err) {
                            done(err);
                        }
                    });

                    await kopnik2.vote(somePredlozhenie, 1);
                    await kopnik2.vote(somePredlozhenie, 0);
                    await kopnik2.vote(somePredlozhenie, -1);
                }
                catch (err) {
                    done(err);
                }
            })();
        });
    });
});