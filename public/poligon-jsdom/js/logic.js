/**
 * Created by alexey2baranov on 9/15/16.
 */

setInterval(
    function(){
        // console.log("from script "+new Date());
    },
    1000);


// console.trace("trace console");
// console.debug("debug console");
log4javascript.getRootLogger().addAppender(new log4javascript.BrowserConsoleAppender());
log4javascript.getRootLogger().trace("trace6 from logic.js");
log4javascript.getRootLogger().debug("debug5 from logic.js");
log4javascript.getRootLogger().info("info4 from logic.js");
log4javascript.getRootLogger().warn("warn3 from logic.js");
log4javascript.getRootLogger().error("error2 from logic.js");
log4javascript.getRootLogger().fatal("fatal1 from logic.js");