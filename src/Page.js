/**
 * Created by alexey2baranov on 8/30/16.
 */
"use strict";

let EventEmitter= require ("events").EventEmitter;

class Page extends EventEmitter{
    constructor(){
        super();
        this.dom= undefined;
        this.kopa= undefined;
    }

    setDom(value){
        this.dom= value;
        this.emit(Page.event.domChanged);
    }

    setKopa(value){
        this.kopa= value;
        this.emit(Page.event.kopaChanged);
    }
}

Page.event={
    domChanged: 'domChanged',
    kopaChanged: 'kopaChanged'
};

module.exports= Page;