/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict";

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
    slovo;

let WAMP = WAMPFactory.getWAMP();

describe('Slovo', function () {
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

    describe('#create()', async function () {
        let slovoValue = "some Slovo temp";

        it('должен опубликовать "kopa.id3.slovoAdded"', async function (done) {
            try {
                let kopnik = models.Kopnik.getReference(KOPNIK);
                let kopa = await models.Kopa.get(KOPA);
                let slovo;

                await WAMP.session.subscribe(`api:model.Kopa.id${KOPA}.slovoAdd`, function (args) {
                    done();
                });

                slovo = await models.Slovo.create({
                    value: slovoValue,
                    owner: kopnik,
                    place: kopa,
                });
            }
            catch (err) {
                done(err);
            }
        });
    });
});