/**
 * Created by alexey2baranov on 8/9/16.
 */
"use strict";

var autobahn = require("autobahn");
let WAMP = require("./WAMPFactory").getWAMP();

WAMP.onopen = function (session, details) {
    /*
     session.call('com.myapp.add2', [2, 3])
     .then(res=>console.log('sum is', res), session.log);
     */
    (async function () {
        try {
            let handler = function (args, kwargs, details) {
                console.log(args, kwargs, details);
            };

            for (let i=0; i<100; i++){
                for (let k=0; k<500; k++) {
                    await session.subscribe(`ru.kopa.model.Kopa.id${i}`, handler);
                }
                console.log(i, process.memoryUsage().rss);
            }

            let start= new Date();
            await session.publish("ru.kopa.model.Kopa.id0", [1, 2, 3], null, {exclude_me: false});
            console.log("total publicsk time", (new Date()-start)/1000);
        } catch (err) {
            console.log(err);
        }
    })();
};

WAMP.open();