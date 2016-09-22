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


describe('order', function () {
    before(function () {
        return new Promise(function (res, rej) {
            WAMP.onopen = function (session, details) {
                session.prefix('api', 'ru.kopa');
                res();
            };
            WAMP.open();
        })
            .catch(err=>console.log);
    });

    after(function () {
        return new Promise(function (res, rej) {
            WAMP.onclose = function (session, details) {
                res();
            };
            WAMP.close();
        });
    });

    it('should handle publication after proc', async function (done) {
        let results= new Map();
        let failCount=0;
        WAMP.session.subscribe("ru.kopa.unitTest.orderTopic", async ([x])=>{
            if (results.has(x)){
                // console.log("done", x, results.get(x));
            }
            else{
                // console.log("fail");
                failCount++;
            }
        });

        for (let x=0; x<100; x++) {
            let eachResult= await WAMP.session.call("ru.kopa.unitTest.orderProc", [x]);
            results.set(x, eachResult);
        }

        if (failCount){
            done(new Error(`${failCount}% fails`));
        }
        else {
            done();
        }
    });
});