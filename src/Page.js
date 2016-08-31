/**
 * Created by alexey2baranov on 8/30/16.
 */
let EventEmitter= require ("events").EventEmitter;

class Page extends EventEmitter{
    constructor(){
        super();
        this.own= undefined;
        this.kopa= undefined;
    }

    setOwn(value){
        this.own= value;
        this.emit(Page.event.ownChanged);
    }

    setKopa(value){
        this.kopa= value;
        this.emit(Page.event.kopaChanged);
    }
}

Page.event={
    ownChanged: 'ownChanged',
    kopaChanged: 'kopaChanged'
};

module.exports= Page;