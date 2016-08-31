/**
 * Created by alexey2baranov on 8/30/16.
 */

class Application {
    static run() {
        let WAMP= require("./WAMPFactory").getWAMP();

        WAMP.onopen = (session, details)=> this.onConnectionOpen(session, details);
        WAMP.onclose = (reason, details)=>this.onConnectionClose(reason, details);

        WAMP.open();
    }

    static async onConnectionOpen(session, details) {
        try {
            this.log.info("connection opened");
            this.kopnik = await model.Kopnik.get(1);

            for (var eachRodina = this.kopnik.rodina; eachRodina; eachRodina = eachRodina.parent) {
                this.log.debug("loading kopnik rodina", eachRodina.id);
                await eachRodina.reload();
                this.log.debug("loaded ", eachRodina.name);
            }

            this.page = new Page();
            this.page.rodina= this.kopnik.rodina;
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