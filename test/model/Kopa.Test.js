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
let ZEMLA2 = 2;
let ZEMLA3 = 3;
let KOPA = 3;

let WAMP = WAMPFactory.getWAMP();

describe('Kopa', function () {
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

    let kopa = null;

    describe('#getReference()', function () {
        it("should return Kopa", function () {
            kopa = models.Kopa.getReference(KOPA);
            assert.equal(kopa instanceof models.Kopa, true);
        });
    });

    describe('#get()', function () {
        it('should return loaded Kopa', async function (done) {
            try {
                kopa = await models.Kopa.get(KOPA);
                assert.equal(kopa instanceof models.Kopa, true);
                assert.equal(kopa._isLoaded, true);
                assert.equal(_.isArray(kopa.attachments), true);
                done();
            }
            catch (err) {
                done(err);
            }
        });
    });

    describe('Slovo.create() emit Kopa#addSlovo', async function () {
        let kopnik,
            kopa;
        it('Kopa#addSlovo', async function (done) {
            try {
                kopnik = await models.Kopnik.get(KOPNIK2);
                kopa = await models.Kopa.get(KOPA);
                kopa.dialog=[];

                let value = "some Slovo temp";
                let slovo = await models.Slovo.create({
                    value: value,
                    place: kopa,
                    owner: kopnik,
                });

                kopa.on(models.Kopa.event.slovoAdd, (sender, add)=> {
                    try {
                        assert.equal(add instanceof models.Slovo, true);
                        assert.equal(sender.dialog[0], add);
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
        });
    });
});