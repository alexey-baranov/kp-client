/**
 * Created by alexey2baranov on 8/26/16.
 */

var assert = require('chai').assert;
let autobahn = require("autobahn");
let config = require("../cfg/main")["local-db"];
let Core = require("../src/Core");
let _=require("lodash");

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
describe('WAMP', function () {
    it('connection open', function (done) {
/*
        если сессия уже открыта в предыдущем тесте,
        то эта сессия открывается моментально,
        то есть даже раньше чем выполнение дойдет до этого блока
        а оно похоже доходит не сразу а через nextTick, то есть уже поздно
*/
        if (Core.getWAMP().session && Core.getWAMP().session.isOpen){
            // console.log("session already opened");
            done();
        }
        Core.getWAMP().onopen = function (session, details) {
            // console.log("session#onopen()");
            done();
        };
    });

    it('ping-pong', function (done) {
        Core.getWAMP().session.call("ru.kopa.ping2pong",[1,2,3],{x:1, y:2, z:3})
            .then(function (res) {
                if (!_.difference(res.args,[1,2,3]).length && _.isEqual(res.kwargs,{x:1, y:2, z:3})) {
                    done();
                }
                else{
                    throw Error();
                }
            })
            .catch(function (er) {
                done(er);
            });
    });
});

Core.getWAMP().open();