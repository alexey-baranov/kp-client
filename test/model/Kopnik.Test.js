/**
 * Created by alexey2baranov on 8/26/16.
 */

var assert = require('chai').assert;
var model = require("../../src/model");
let autobahn = require("autobahn");
let config = require("../../cfg/main")[process.env.NODE_ENV || 'local-db'];
require("../../src/bootstrap");
let _ = require("lodash");
let WAMPFactory= require("../../src/WAMPFactory");

let KOPNIK1 = 2;
let KOPNIK2 = 3;
let ZEMLA1 = 2;
let ZEMLA2 = 3;

let WAMP= WAMPFactory.getWAMP();

describe('Kopnik', function () {
    before(function () {
        return new Promise(function (res, rej) {
            WAMP.onopen = function (session, details) {
                res();
            };
            WAMP.open();
        });
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
});