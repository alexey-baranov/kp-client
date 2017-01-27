/**
 * Created by alexey2baranov on 8/30/16.
 */
"use strict";

import Connection from './Connection'

class Application {
  constructor() {
    this.state= Application.State.Auth

  }

  static getInstance() {
    if (!Application.instance) {
      Application.instance = new Application()
    }
    return Application.instance
  }

  run() {
    document.applicationView= new
      el: document.createElement('div'),
      render: (h) => h(Hello)
    })

    WAMP.onopen = (session, details) => this.onConnectionOpen(session, details);
    WAMP.onclose = (reason, details) => this.onConnectionClose(reason, details);

    WAMP.open();
  }

  static async onConnectionOpen(session, details) {
    try {
      this.log.info("connection opened");
      this.kopnik = await model.Kopnik.get(2);

      for (var eachDom = this.kopnik.dom; eachDom; eachDom = eachDom.parent) {
        this.log.debug("loading kopnik dom", eachDom.id);
        await eachDom.reload();
        this.log.debug("loaded ", eachDom.name);
      }

      this.page = new Page();
      this.page.dom = this.kopnik.dom;
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

Application.State={
  Auth: "auth",
  Register: "register",
  Main: "main"
}

module.exports = global.Application = Application;

let config = require("./../cfg/main")[process.env.NODE_ENV];
let autobahn = require('autobahn');
let model = require("./model");
