/**
 * Created by alexey2baranov on 8/26/16.
 */

var assert = require('chai').assert;
var model = require("../../src/model");
let KopnikView = require("../../src/view/KopnikView");
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

describe('KopnikView', function () {
    let kopnik1, kopnik1View;

    before(function () {
        return new Promise(function (res, rej) {
            if (Core.getWAMP().session && Core.getWAMP().session.isOpen) {
                // console.log("session already opened");
                res();
            }
            Core.getWAMP().onopen = function (session, details) {
                res();
            };
        })
            .then(function () {
                return model.Kopnik.get(KOPNIK1);
            })
            .then(function (kopnik) {
                kopnik1 = kopnik;
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
});

WAMP.open();