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
    golos;

let WAMP = WAMPFactory.getWAMP();

describe('Golos', function () {
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
        // return require("../UnitTestTempDataCleaner").clean("Golos");
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
        let golos;

        it('should publish "Predlozhenie.id1.golosAdd"', async function (done) {
            try {
                let kopnik = models.Kopnik.getReference(KOPNIK);
                let kopa = await models.Kopa.get(KOPA);

                await WAMP.session.subscribe(`api:model.Predlozhenie.id${PREDLOZHENIE}.golosAdd`, function (args) {
                    if (!golos) {
                        done(new Error("событие пришло раньше чем голос был создан"));
                    }
                    else{
                        done();
                    }
                });

                golos = await models.Golos.create({
                    for: models.Predlozhenie.getReference(PREDLOZHENIE),
                    owner: kopnik,
                    value: 1,
                });
            }
            catch (err) {
                done(err);
            }
        });
    });
});