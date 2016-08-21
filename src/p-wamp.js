/**
 * Created by alexey2baranov on 8/9/16.
 */
var autobahn= require("autobahn");

var connection = new autobahn.Connection({
    url: "ws://127.0.0.1:8080/ws",
    realm: "kopa"
});

connection.onopen = function (session, details) {
/*
    session.call('com.myapp.add2', [2, 3])
        .then(res=>console.log('sum is', res), session.log);
*/

    session.subscribe("com.myapp.oncounter", session.log);
};

connection.open();