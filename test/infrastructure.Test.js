/**
 * Created by alexey2baranov on 8/26/16.
 */

var assert = require('chai').assert;

let config = require("../cfg/main")[process.env.NODE_ENV || 'local-db'];
require("../src/bootstrap");
let Core = require("../src/Core");
let _ = require("lodash");
let WAMPFactory = require("../src/WAMPFactory");


let WAMP = WAMPFactory.getWAMP();


describe('Infrastructure', function () {
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

    it('WAMP', function (done) {
        /*
         если сессия уже открыта в предыдущем тесте,
         то эта сессия открывается моментально,
         то есть даже раньше чем выполнение дойдет до этого блока
         а оно похоже доходит не сразу а через nextTick, то есть уже поздно
         */
        if (WAMP.session && WAMP.session.isOpen) {
            // console.log("session already opened");
            done();
        }
        WAMP.onopen = function (session, details) {
            // console.log("session#onopen()");
            done();
        };
    });

    it('server', function (done) {
        WAMP.session.call("ru.kopa.pingPong", [1, 2, 3], {x: 1, y: 2, z: 3})
            .then(function (res) {
                if (!_.difference(res.args, [1, 2, 3]).length && _.isEqual(res.kwargs, {x: 1, y: 2, z: 3})) {
                    done();
                }
                else {
                    throw Error();
                }
            })
            .catch(function (er) {
                done(er);
            });
    });

    it('database', function (done) {
        let word = "КОПА";
        WAMP.session.call("ru.kopa.pingPongDatabase", [word])
            .then(function (res) {
                if (res == word) {
                    done();
                }
                else {
                    done(new Error(`database send result other then word ("${word}" <> "${res}")`));
                }
            })
            .catch(function (er) {
                done(er);
            });
    });


    it('should throw Error', async function (done) {
        let errorMessage = "sadkljfaskldjfs;af";
        try {
            await WAMP.session.call("ru.kopa.error", [errorMessage]);
            done(new Error("Error was not thrown"));
        }
        catch (err) {
            if (err.error != "MySuperError") {
                done(new Error("invalid error type"));
            }
            else if (err.args[0] != errorMessage) {
                done(new Error("invalid error message"));
            }
            else if (!_.isArray(err.kwargs.stack)) {
                done(new Error("invalid error stack"));
            }
            else {
                done();
            }
        }
    });
});