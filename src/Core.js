/**
 * Created by alexey2baranov on 8/20/16.
 */
"use strict";

class Core {
    /**
     * @returns {Connection}
     */
    static getWAMP() {
                if (!Core._WAMP) {
                    throw new Error("no WAMP instance");
                }
                return Core._WAMP;
    }

    static setWAMP(value){
        Core._WAMP= value;
    }
}

module.exports = Core;

