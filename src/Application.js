/**
 * Created by alexey2baranov on 8/30/16.
 */

class Application {
    static run() {
        Application.connection = new autobahn.Connection({
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
        this.connection.log = this.log;

        this.connection.onopen = (session, details)=> this.onConnectionOpen(session, details);
        this.connection.onclose = (reason, details)=>this.onConnectionClose(reason, details);

        this.connection.open();
    }

    static async onConnectionOpen(session, details) {
        try {
            this.log.info("connection opened");
            this.kopnik = await model.Kopnik.get(1);

            for (var eachOwn = this.kopnik.own; eachOwn; eachOwn = eachOwn.parent) {
                this.log.debug("loading kopnik own", eachOwn.id);
                await eachOwn.reload();
                this.log.debug("loaded ", eachOwn.name);
            }

            this.page = new Page();
            this.pageView = new PageView(this.page, null, "p");

            this.pageView.get$().appendTo(document.body);
            this.pageView.attach();
        }
        catch (err) {
            this.log.error("Application.onConnectionOpen()", err);
            throw err;
        }
    };

    static async onConnectionClose(reason, details) {
        try {
            this.log.info("connection closed");
        }
        catch (err) {
            this.log.error("Application.onConnectionClose()", err);
            throw err;
        }
    };
}

module.exports= global.Application = Application;

let config = require("./../cfg/main")[process.env.NODE_ENV || 'local-db'];
let autobahn = require('autobahn');
let model=require("./model");
let Page = require("./Page");
let PageView = require("./view/PageView");

Application.log = global.log4javascript.getLogger(Application.name);