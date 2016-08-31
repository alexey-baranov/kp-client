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
    after(function(){
        return new Promise(function (res) {
            WAMP.onclose = function () {
                res();
            };
            WAMP.close();
        });
    });

    it('WAMP', function (done) {
        return new Promise(function (res, rej) {
            WAMP.onopen = function (session, details) {
                done();
                res();
            };
            WAMP.open();
        });
    });

    it('WAMP discloseCaller', async function (done) {
        try{
            let result= await WAMP.session.call("ru.kopa.discloseCaller", [], {}, {disclose_me: true});
            assert.equal(result, "alexey_baranov@inbox.ru");
            done();
        }
        catch(err){
            done(err);
        }
    });

    it('server', function (done) {
        WAMP.session.call("ru.kopa.pingPong", [1, 2, 3], {x: 1, y: 2, z: 3}, {disclose_me: true})
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