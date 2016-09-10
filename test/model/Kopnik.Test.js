/**
 * Created by alexey2baranov on 8/26/16.
 */

var assert = require('chai').assert;
var models = require("../../src/model");
let autobahn = require("autobahn");
let config = require("../../cfg/main")[process.env.NODE_ENV || 'local-db'];
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

    describe("#get()", function () {
        it('#rodina should be instance of Zemla', function (done) {
            models.Kopnik.get(KOPNIK2)
                .then(function (localKopnik) {
                    if (localKopnik.rodina instanceof models.Zemla) {
                        done();
                    }
                    else {
                        done(new Error());
                    }
                });
        });
    });

    describe("#setStarshina()", function (done) {
        let someKopnik1,
            someKopnik2;
        /**
         * создаю два копника один старшина другому на втором
         */
        it('should emit voiskoChange twice', async function (done) {
            try {
                let eventCount = 0;
                let kopnik2 = await models.Kopnik.get(KOPNIK2);

                kopnik2.on(models.Kopnik.event.voiskoChange, async()=> {
                    eventCount++;

                    if (eventCount ==1 && kopnik2.voiskoSize!=2) {
                        done(new Error("kopnik2.voiskoSize!=2"));
                    }

                    if (eventCount ==2 && kopnik2.voiskoSize!=3) {
                        done(new Error("kopnik2.voiskoSize!=3"));
                    }
                    if (eventCount ==2){
                        done();
                    }
                });

                someKopnik1 = await models.Kopnik.create({
                    name: "temp",
                    surname: "temp",
                    patronymic: "temp",
                    birth: 1900,
                    starshina: models.Kopnik.getReference(KOPNIK2),
                    zemla: models.Zemla.getReference(ZEMLA2),
                });

                someKopnik2 = await models.Kopnik.create({
                    name: "temp",
                    surname: "temp",
                    patronymic: "temp",
                    birth: 1900,
                    starshina: someKopnik1,
                    zemla: models.Zemla.get(ZEMLA2),
                });
            }
            catch (err) {
                done(err);
            }
        });

        /**
         * перекидываю копника с дружинником на третьего
         * сначала прилетают события открепления дружины
         * потом прикрепления
         */
        it('should emit voiskoChange twice', async function (done) {
            try {
                let kopnik4 = await models.Kopnik.get(KOPNIK4);

                /**
                 * сначала прилетают события открепления дружины
                 * потом прикрепления
                 */
                kopnik2.once(models.Kopnik.event.voiskoChange, async()=> {
                    try{
                        assert.equal(kopnik2.voiskoSize, 1, "kopnik2.voiskoSize, 1");
                        kopnik4.once(models.Kopnik.event.voiskoChange, async()=> {
                            try{
                                assert.equal(kopnik4.voiskoSize, 2, "kopnik4.voiskoSize, 2");
                                done();
                            }
                            catch(err){
                                done(err);
                            }
                        });
                    }
                    catch(err){
                        done(err);
                    }
                });
                someKopnik2.setDruzhina(models.Kopnik.getReference(KOPNIK3));
            }
            catch (err) {
                done(err);
            }
        });
    });


});