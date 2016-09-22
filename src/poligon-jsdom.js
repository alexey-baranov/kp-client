/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict";

require("../src/bootstrap");
var assert = require('chai').assert;
// var models = require("../src/model");
// let SlovoView = require("../src/view/SlovoAsListItemView");
let _ = require("lodash");
let WAMPFactory = require("../src/WAMPFactory");
let jsdom = require("jsdom");

let window,
    KOPNIK2 = 2;
let KOPNIK3 = 3;
let ZEMLA2 = 2;
let ZEMLA3 = 3,

    SLOVO = 1;

jsdom.env({
    url: "http://localhost:8080/public/poligon-jsdom/index.html",
    virtualConsole: jsdom.createVirtualConsole().sendTo(console),
    features: {
        FetchExternalResources : ["script"],
        ProcessExternalResources: ["script"]
    },
    done: function (err, win) {
        console.log("done");
        // win.log4javascript.getRootLogger().debug(123);

        if (err) {
            console.log(err, win);
        }
    }
});