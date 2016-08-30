/**
 * Created by alexey2baranov on 8/30/16.
 */

//configuring loggers
    {
    require("./log4javascript.mock");

    let layout = new global.log4javascript.PatternLayout("%c [%-5p] - %m{2}");
    let consoleAppender = new global.log4javascript.BrowserConsoleAppender();
    consoleAppender.setLayout(layout);
    global.log4javascript.getRootLogger().addAppender(consoleAppender);
}