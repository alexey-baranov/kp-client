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

let KOPNIK = 2,
    KOPNIK2 = 2,
    KOPNIK3 = 3,
    ZEMLA = 2,
    ZEMLA2 = 2,
    ZEMLA3 = 3,
    KOPA = 3,
    PREDLOZHENIE=1,
    predlozhenie;

let WAMP = WAMPFactory.getWAMP();

describe('Predlozhenie', function () {
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
        // return require("../UnitTestTempDataCleaner").clean("Predlozhenie");
    });

    after(function () {
        return new Promise(function (res, rej) {
            WAMP.onclose = function (session, details) {
                res();
            };
            WAMP.close();
        });
    });

    describe('#create()', async function () {
        let predlozhenie,
            predlozhenieValue = `some Predlozhenie temp `+new Date().getTime();

        it('должен опубликовать "kopa.id3.predlozhenieAdd"', async function (done) {
            try {
                let kopnik = models.Kopnik.getReference(KOPNIK);
                let kopa = await models.Kopa.get(KOPA);

                await WAMP.session.subscribe(`api:model.Kopa.id${KOPA}.predlozhenieAdd`, function (args) {
                    done();
                });

                predlozhenie = await models.Predlozhenie.create({
                    value: predlozhenieValue,
                    initiator: kopnik,
                    place: kopa,
                });
            }
            catch (err) {
                done(err);
            }
        });
    });

    describe('events', async function () {
        let predlozhenie;

        it('Golos.create() -> Predlozhenie.emit(addGolos)', async function (done) {
            try {
                predlozhenie = await models.Predlozhenie.get(PREDLOZHENIE);

                predlozhenie.golosa=[];
                predlozhenie.on(models.Predlozhenie.event.golosAdd, (sender, add)=> {
                    try {
                        assert.equal(add, golos);
                        done();
                    }
                    catch (err) {
                        done(err);
                    }
                });

                let golos = await models.Golos.create({
                    value: 1,
                    for: predlozhenie,
                    owner: models.Kopnik.getReference(KOPNIK),
                });
            }
            catch (err) {
                done(err);
            }
        });
    });
});