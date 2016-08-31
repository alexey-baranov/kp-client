/**
 * Created by alexey2baranov on 8/30/16.
 */
let EventEmitter= require ("events").EventEmitter;

class Page extends EventEmitter{
    constructor(){
        super();
        this.rodina= undefined;
        this.kopa= undefined;
    }

    setRodina(value){
        this.rodina= value;
        this.emit(Page.event.rodinaChanged);
    }

    setKopa(value){
        this.kopa= value;
        this.emit(Page.event.kopaChanged);
    }
}

Page.event={
    rodinaChanged: 'rodinaChanged',
    kopaChanged: 'kopaChanged'
};

module.exports= Page;