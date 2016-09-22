/**
 * Created by alexey2baranov on 8/20/16.
 */
"use strict";

/**
 * загружается в тестовую html страницу jsdom
 */
require("../src/bootstrap");
module.exports={
    $: require("jquery"),
    views: require("../src/view")
};