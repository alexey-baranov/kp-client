/**
 * Created by alexey2baranov on 8/20/16.
 */
"use strict";

let config = require("./../cfg/main")[process.env.NODE_ENV];
let autobahn = require("autobahn");

class WAMPFactory {
    /**
     * @returns {Connection}
     */
    static getWAMP() {
        if (!this._WAMP) {
            this._WAMP = new autobahn.Connection({
                url: `${config.WAMP.schema}://${config.WAMP.host}:${config.WAMP.port}/${config.WAMP.path}`,
                realm: "kopa",
                authmethods: ['ticket'],
                "authid": config.unittest2.username,
                onchallenge: function (session, method, extra) {
                    return config.unittest2.password;
                },
                use_es6_promises: true,
                max_retries: -1,
                max_retry_delay: 5
            });
        }
        return this._WAMP;
    }

    static setWAMP(value) {
        this._WAMP = value;
    }
}

module.exports = WAMPFactory;

