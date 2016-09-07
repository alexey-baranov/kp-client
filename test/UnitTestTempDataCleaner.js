/**
 * Created by alexey2baranov on 9/6/16.
 */

let _ = require("lodash");
let WAMP= require("../src/WAMPFactory").getWAMP();


class UnitTestTempDataCleaner{
    static clean(types){
        if (_.isString(types)){
            types= [types];
        }

        return WAMP.session.call("ru.kopa.unitTest.cleanTempData", types);
    }
}

module.exports= UnitTestTempDataCleaner;