/**
 * Created by alexey2baranov on 09.09.17.
 */

import log from "loglevel"
import prefix from "loglevel-plugin-prefix"
import toString from "loglevel-plugin-test"

prefix.apply(log, {template:"%t [%l] %n: "})
if (process.env.NODE_ENV=="testing") {
  toString.apply(log, {})
}

// Be sure to call setLevel method in order to apply plugin
log.setLevel(log.levels.DEBUG)
// log.getLogger("logger name").warn("some warn")
// log.getLogger("logger name").warn({a:"some warn"})


// log.getLogger("StateManager").setLevel("info")
log.getLogger("location.vue").setLevel("info")
// log.getLogger("scroll.vue").setLevel("info")

export default log;
