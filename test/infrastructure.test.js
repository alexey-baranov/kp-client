/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict";

var assert = require('chai').assert;

let config = require("../cfg/main")[process.env.NODE_ENV || 'local-db'];
require("../src/bootstrap");
let Core = require("../src/Core");
let _ = require("lodash");
let WAMPFactory = require("../src/WAMPFactory");


let WAMP = WAMPFactory.getWAMP();


describe('Infrastructure', function () {
    after(function () {
        return new Promise(function (res) {
            WAMP.onclose = function () {
                res();
            };
            WAMP.close();
        });
    });

    it('WAMP', function () {
        return new Promise(function (res, rej) {
            WAMP.onopen = function (session, details) {
                res();
            };
            WAMP.onclose = function () {
                rej();
            };
            WAMP.open();
        });
    });

    it('WAMP discloseCaller', async function () {
        let result = await WAMP.session.call("ru.kopa.discloseCaller", [], {}, {disclose_me: true});
        assert.equal(result, "unittest2@domain.ru");
    });

    it('server', async function () {
        let result = await WAMP.session.call("ru.kopa.pingPong", [1, 2, 3], {x: 1, y: 2, z: 3}, {disclose_me: true})
        if (_.difference(result.args, [1, 2, 3]).length && _.isEqual(result.kwargs, {x: 1, y: 2, z: 3})) {
            throw Error("difference");
        }
    });

    it('database', async function () {
        let word = "КОПА";
        let result= await WAMP.session.call("ru.kopa.pingPongDatabase", [word]);
        assert.equal(result, word);
    });

    it('should throw Error', async function () {
        let errorMessage = "sadkljfaskldjfs;af";
        let errorWasNotThrown= false;
        try {
            await WAMP.session.call("ru.kopa.error", [errorMessage]);
            errorWasNotThrown= true;
        }
        catch (err) {
            if (err.error != "MySuperError") {
                throw new Error("invalid error type");
            }
            else if (err.args[0] != errorMessage) {
                throw new Error("invalid error message");
            }
            else if (!_.isArray(err.kwargs.stack)) {
                throw new Error("invalid error stack");
            }
        }

        if (errorWasNotThrown){
            throw new Error("error was not thrown");
        }
    });
});