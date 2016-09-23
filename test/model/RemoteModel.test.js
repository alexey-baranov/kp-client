/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict"; //my use strict
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

describe('RemoteModel', function () {
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

    let kopa = null;


    describe('#getReference()', function () {
        it('should return Kopnik reference', function () {
            let kopnik1 = models.Kopnik.getReference(KOPNIK2);
            assert.equal(true, kopnik1 instanceof models.Kopnik);
            assert.equal(KOPNIK2, kopnik1.id);
            assert.equal(false, kopnik1._isLoaded);
            assert.equal(kopnik1, models.Kopnik.getReference(KOPNIK2));
        });
    });

    describe('#get()', function () {
        let kopnik2 = null;
        // this.timeout(5000);
        it('should return loaded Kopnik Unit Test', async function () {
            // throw new Error(123);
            kopnik2= await models.Kopnik.get(KOPNIK2);

            assert.equal(kopnik2 instanceof models.Kopnik, true, "kopnik2 instanceof models.Kopnik");
            assert.equal(kopnik2.name, "Unit", "kopnik2.name, Unit");
            assert.equal(kopnik2._isLoaded, true, "kopnik2._isLoaded, true");
            assert.equal(_.isArray(kopnik2.attachments), true, "_.isArray(kopnik2.attachments), true");
        });

        it("2'nd call should return equal object", async function () {
            let sameKopnik= await models.Kopnik.get(KOPNIK2);
            assert.equal(sameKopnik, kopnik2, "sameKopnik, kopnik2");
        });

        it("should return equal as #getReference()", async function () {
            let localKopnik= await models.Kopnik.get(KOPNIK2);
            assert.equal(localKopnik,models.Kopnik.getReference(KOPNIK2));
        });
    });

    describe('#getPlain()', function () {
        it("should return same value for plain properties", function () {
            let value = {string: "123", number: 123, date: new Date()};
            let plain = models.RemoteModel.getPlain(value);
            assert.equal(value.string, plain.string);
            assert.equal(value.number, plain.number);
            assert.equal(value.date, plain.date);
        });

        it('should return ids for reference and models', async function () {
            let value = {reference: models.Kopnik.getReference(KOPNIK2), model: await models.Kopnik.get(KOPNIK3)};
            let plain = models.RemoteModel.getPlain(value);
            assert.equal(plain.reference_id, KOPNIK2);
            assert.equal(plain.model_id, KOPNIK3);
        });

        it('should return Array<id> for arrays', async function () {
            let value = {array: [models.Kopnik.getReference(KOPNIK2), await models.Kopnik.get(KOPNIK3)]};
            let plain = models.RemoteModel.getPlain(value);
            assert.equal(plain.array[0], KOPNIK2);
            assert.equal(plain.array[1], KOPNIK3);
        });
    });

    describe('.create() (by Slovo)', function () {
        let slovo;
        let slovoValue = "123 temp",
            slovoNote = "456";
        it("should create new Slovo with id", async function () {
            slovo = await models.Slovo.create({
                place: models.Kopa.getReference(KOPA),
                owner: models.Kopnik.getReference(KOPNIK2),
                value: slovoValue,
                note: slovoNote,
            });
            assert.equal(slovo instanceof models.Slovo, true, "instanceof");
            assert.equal(_.isNumber(slovo.id), true, "slovo.id");
            assert.equal(slovo._isLoaded, true, "slovo._isLoaded");
        });

        it('should be saved into database', async function () {
            await slovo.reload();
            assert.equal(slovo.place.id, KOPA, "slovo.place.id");
            assert.equal(slovo.owner.id, KOPNIK2, "slovo.owner.id");
            assert.equal(slovo.value, slovoValue, "slovo.value");
            assert.equal(slovo.note, slovoNote, "slovo.note");
        });

        it('should publish event after create done', async function (done) {

            await WAMP.session.subscribe(`api:model.Kopa.id${KOPA}.slovoAdd`, function (args) {
                done();
/*
                if (models.Slovo.getReference(args[0])._isLoaded) {
                    done();
                }
                else {
                    done(new Error(`api:model.Kopa.id${KOPA}.slovoAdd publicated before create done`));
                }
*/
            });

            slovo = await models.Slovo.create({
                place: models.Kopa.getReference(KOPA),
                owner: models.Kopnik.getReference(KOPNIK2),
                value: "some value temp " + new Date().getTime(),
            });
        });
    });

    describe('Zemla.save()', async function () {
        let zemla,
            zemlaNote = "unit test " + new Date().getTime();

        before(async function () {
            zemla = await models.Zemla.get(ZEMLA2);
        });

        it("should publicate event", async function (done) {
            try {
                await WAMP.session.subscribe("ru.kopa.model.Zemla.id2.change", function () {
                    done();
                });
                zemla.note = zemlaNote;
                await zemla.save();
            }
            catch (err) {
                done(err);
            }
        });

        it('should be saved into database', async function () {
            await zemla.reload();
            assert.equal(zemla.note, zemlaNote, "zemla.note");
        });
    });
});