/**
 * Created by alexey2baranov on 8/20/16.
 */
let $= require("jquery");
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandel rejection in promise. Reason: ' + JSON.stringify(reason), JSON.stringify(promise));
});

require("./bootstrap");
let log= global.log4javascript.getLogger("indexjs");
let Application= require("./Application");

$(function(){
    Application.run();
});
