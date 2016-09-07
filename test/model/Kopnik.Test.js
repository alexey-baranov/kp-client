/**
 * Created by alexey2baranov on 8/26/16.
 */

var assert = require('chai').assert;
var models = require("../../src/model");
let autobahn = require("autobahn");
let config = require("../../cfg/main")[process.env.NODE_ENV || 'local-db'];
require("../../src/bootstrap");
let _ = require("lodash");
let WAMPFactory= require("../../src/WAMPFactory");

let KOPNIK2 = 2;
let KOPNIK3 = 3;
let ZEMLA2 = 2;
let ZEMLA3 = 3;
let KOPA=3;

let WAMP= WAMPFactory.getWAMP();

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

    after(function(){
        // return require("../UnitTestTempDataCleaner").clean("Slovo");
    });

    after(function(){
        return new Promise(function (res, rej) {
            WAMP.onclose = function (session, details) {
                res();
            };
            WAMP.close();
        });
    });

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
        let kopnik1 = null;
        // this.timeout(5000);
        it('should return loaded Kopnik Unit Test', function (done) {
            // throw new Error(123);
            models.Kopnik.get(KOPNIK2)
                .then(function (localKopnik) {
                    kopnik1 = localKopnik;
                    if (kopnik1 instanceof models.Kopnik && kopnik1.name == "Unit" && kopnik1._isLoaded && _.isArray(kopnik1.attachments)) {
                        done();
                    }
                    else {
                        done(new Error());
                    }
                })
                .catch(function (er) {
                    done(er);
                });
        });

        it("2'nd call should return equal object", function (done) {
            models.Kopnik.get(KOPNIK2)
                .then(function (localKopnik) {
                    if (kopnik1 == localKopnik) {
                        done();
                    }
                    else {
                        done(new Error());
                    }
                })
                .catch(function () {

                });
        });

        it("should return equal as #getReference()", function (done) {
            models.Kopnik.get(KOPNIK2)
                .then(function (localKopnik) {
                    if (localKopnik == models.Kopnik.getReference(KOPNIK2)) {
                        done();
                    }
                    else {
                        done(new Error())
                    }
                });
        });

        it('#rodina should return instance of Zemla', function (done) {
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
});