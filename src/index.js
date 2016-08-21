/**
 * Created by alexey2baranov on 8/20/16.
 */

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandel rejection in promise. Reason: ' + JSON.stringify(reason), JSON.stringify(promise));
});

let autobahn = require('autobahn');
let config = require("./../cfg/main")["local-db"];
let Core= require("./Core");
let models= require("./models" );

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

WAMP.onopen= async function(session, details){
    console.log("connection opened");
    let alexey2baranov= models.Kopnik.getReference(1);
    await alexey2baranov.refresh();
    console.log('kopnik refreshed!!!', alexey2baranov.name, alexey2baranov.email);
};
WAMP.open();