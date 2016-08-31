/**
 * Created by alexey2baranov on 8/30/16.
 */

if (!global.log4javascript){
    console.addAppender= function(){};
    console.debug= console.log;

    global.log4javascript= class{
        static getRootLogger(){
            return console;
        }
        static getLogger(){
            return this.getRootLogger();
        }
        static setShowStackTraces(){

        }
    };

    global.log4javascript.BrowserConsoleAppender= class{
        setLayout(){}
    };
    global.log4javascript.PatternLayout= function(){};
}