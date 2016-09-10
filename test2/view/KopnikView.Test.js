/**
 * Created by alexey2baranov on 8/26/16.
 */
/*

var assert = require('chai').assert;
var model = require("../../src/model");
let KopnikView = require("../../src/view/KopnikView");
let _ = require("lodash");
let WAMPFactory = require("../../src/WAMPFactory");
*/

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

/*
let KOPNIK1 = 2;
let KOPNIK2 = 3;
let ZEMLA1 = 2;
let ZEMLA2 = 3;

let WAMP = WAMPFactory.getWAMP();
*/

/*
describe('KopnikView', function () {
    let kopnik1, kopnik1View;
    before(function () {
        return new Promise(function (res, rej) {
            WAMP.onopen = function (session, details) {
                res();
            };
            WAMP.open();
        })
            .then(function () {
                return model.Kopnik.get(KOPNIK1);
            })
            .then(function (kopnik) {
                kopnik1 = kopnik;
            });
    });


    after(function () {
        return new Promise(function (res, rej) {
            WAMP.onclose = function (session, details) {
                res();
            };
            WAMP.close();
        });
    });

    describe('#constructor()', function () {
        it('should not throw error)', function () {
            kopnik1View = new KopnikView(kopnik1, null, "unitTest");
        });
    });

    describe('#getHTML()', function () {
        it('HTML not empty string', function () {
            let HTML = kopnik1View.getHTML();
            assert.equal(HTML.length > 0, true);
        });
    });
});*/
