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
    PREDLOZHENIE=1,
    golos;

let WAMP = WAMPFactory.getWAMP();

describe('Golos', function () {
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
        it('should throw error', function (done) {
            (async function(){
                try {
                    golos= await models.Golos.create({
                        subject: models.Predlozhenie.getReference(PREDLOZHENIE),
                        value: 1,
                        owner: models.Kopnik.getReference(KOPNIK2),
                    });
                    done(new Error("golos was created"));
                }
                catch (err) {
                    done();
                }
            })();
        });
    });
});