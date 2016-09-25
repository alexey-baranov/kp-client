/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict";

require("../src/bootstrap");
var assert = require('chai').assert;
let _ = require("lodash");
let jsdom = require("jsdom");

let window,
    KOPNIK2 = 2;
let KOPNIK3 = 3;
let ZEMLA2 = 2;
let ZEMLA3 = 3,

    SLOVO = 1;

describe.skip('jsdom', function () {

    before(function () {
    });


    after(function () {
    });

    describe('#env()', function () {
        it('should not throw error)', function (done) {
            jsdom.env({
                url: "http://localhost:8080/test",
                virtualConsole: jsdom.createVirtualConsole().sendTo(console),
                done: function (err, win) {
                    if (err) {
                        done(err);
                    }
                    else {
                        done();
                    }
                }
            });
        });
    });
});