/**
 * Created by alexey2baranov on 8/30/16.
 */
"use strict";

global= global || window;

//configuring loggers
{
    require("./log4javascript.mock");

    let layout = new global.log4javascript.PatternLayout("%c [%-5p] - %m{2}");
    let consoleAppender = new global.log4javascript.BrowserConsoleAppender();
    consoleAppender.setLayout(layout);
    global.log4javascript.getRootLogger().addAppender(consoleAppender);
    global.log4javascript.setShowStackTraces(true); //стектрейс показывается дважды, зато без лишнииз строк log4javascript
}