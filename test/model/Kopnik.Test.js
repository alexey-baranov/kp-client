/**
 * Created by alexey2baranov on 8/26/16.
 */

var assert = require('chai').assert;
var model = require("../../src/model");
let autobahn = require("autobahn");
let config = require("../../cfg/main")["local-db"];
let Core = require("../../src/Core");
let _ = require("lodash");

let WAMP = new autobahn.Connection({
    url: `${config.WAMP.schema}://${config.WAMP.host}:${config.WAMP.port}/${config.WAMP.path}`,
    realm: "kopa",
    authmethods: ['ticket'],
    authid: "alexey_baranov@inbox.ru",
    onchallenge: function (session, method, extra) {
        return "alexey_baranov@inbox.ru";
    },
    use_es6_promises: true,
    max_retries: -1,
    max_retry_delay: 5
});
Core.setWAMP(WAMP);

require('testdom')('', {
    /*     localStorage: 'localStorage',
     navigator: {
     mediaDevices: {
     enumerateDevices: function () {
     return Promise.resolve([device1, device2, device3, device4]);
     }
     }
     }*/
});

let KOPNIK1 = 2;
let KOPNIK2 = 3;
let ZEMLA1 = 2;
let ZEMLA2 = 3;

describe('Kopnik', function () {
    before(function () {
        return new Promise(function (res, rej) {
            if (Core.getWAMP().session && Core.getWAMP().session.isOpen){
                res();
            }
            Core.getWAMP().onopen = function (session, details) {
                res();
            };
        });
    });

    describe('#getReference()', function () {
        let kopnik1 = model.Kopnik.getReference(KOPNIK1);

        it('should return Kopnik instance', function () {
            assert.equal(true, kopnik1 instanceof model.Kopnik);
        });
        it('should return Kopnik with id=1', function () {
            assert.equal(KOPNIK1, kopnik1.id);
        });
        it('should return Kopnik _isLoaded==false', function () {
            assert.equal(false, kopnik1._isLoaded);
        });

        it("2'nd call should return same object", function () {
            assert.equal(kopnik1, model.Kopnik.getReference(KOPNIK1));
        });
    });

    describe('#get()', function () {
        let kopnik1 = null;
        // this.timeout(5000);
        it('should return loaded Kopnik Unit Test', function (done) {
            // throw new Error(123);
            model.Kopnik.get(KOPNIK1)
                .then(function (localKopnik) {
                    kopnik1 = localKopnik;
                    if (kopnik1 instanceof model.Kopnik && kopnik1.name == "Unit" && kopnik1._isLoaded && _.isArray(kopnik1.attachments)) {
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
            model.Kopnik.get(KOPNIK1)
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
            model.Kopnik.get(KOPNIK1)
                .then(function (localKopnik) {
                    if (localKopnik == model.Kopnik.getReference(KOPNIK1)) {
                        done();
                    }
                    else {
                        done(new Error())
                    }
                });
        });

        it('#own should return instance of Zemla', function (done) {
            model.Kopnik.get(KOPNIK1)
                .then(function (localKopnik) {
                    if (localKopnik.own instanceof model.Zemla) {
                        done();
                    }
                    else {
                        done(new Error());
                    }
                });
        });
    });
})
;

WAMP.open();