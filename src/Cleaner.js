/**
 * Created by alexey2baranov on 9/6/16.
 */
"use strict";
let _ = require("lodash");
let Connection = require("../src/Connection").default


class Cleaner{
    static clean(types){
        if (_.isString(types)){
            types= [types]
        }

        return Connection.getInstance().session.call("ru.kopa.unitTest.cleanTempData", types)
    }
}

module.exports= Cleaner
