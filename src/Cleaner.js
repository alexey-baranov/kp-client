/**
 * Created by alexey2baranov on 9/6/16.
 */
"use strict";
let _ = require("lodash");
import Connection from "../src/Connection"


class Cleaner{
    static clean(types){
        if (_.isString(types)){
            types= [types]
        }

        return Connection.getInstance().session.call("ru.kopa.unitTest.cleanTempData", types)
    }
}

module.exports= Cleaner
