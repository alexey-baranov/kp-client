/**
 * Created by alexey2baranov on 8/30/16.
 */
"use strict";

global= global || window;

if (!global.log4javascript){
    class Logger{
        constructor(){
            this.trace= this.debug= this.info= this.warn= this.error= this.fatal= function(){
                // console.log(" ");
                console.log.apply(console, arguments);
            };

            this.addAppender= function(){};

        }

    }

    global.log4javascript= class{
        static getRootLogger(){
            return new Logger();
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
    global.log4javascript.PatternLayout= class{};
}