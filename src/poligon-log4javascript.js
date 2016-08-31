/**
 * Created by alexey2baranov on 8/9/16.
 */
require("./log4javascript.mock");

let log= global.log4javascript.getLogger("test");
let layout= new global.log4javascript.PatternLayout("%c [%-5p] - %m{2}");
let appender= new global.log4javascript.BrowserConsoleAppender();
appender.setLayout(layout);
log.addAppender(appender);

try{
    let x=1;
    throw new Error(123);
}
catch (er){
    log.error( er);
    log.error("jkhjk hjk ", er);
}
log.debug(123);