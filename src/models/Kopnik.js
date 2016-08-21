/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var DisplacingTimer= require("displacing-timer");
var RemoteModel= require("./RemoteModel");


class Kopnik extends RemoteModel{
    constructor(id) {
        super(id);

        this.onlineTimer= new DisplacingTimer(this, this.onlineTimer_tick, Kopnik.OFFLINE_INTERVAL-1500, DisplacingTimer.Type.Interval);

        this.email= undefined;
        this.name = undefined;
        this.surname = undefined;
        this.patronymic = undefined;
        this.birth= undefined;
        this.isOnline= undefined;
    }

    updateLastActiveTime(){
        return new WS().call("kopnik.php/updateLastActiveTime", {PERSON:this.id})
            .then(kopnikAsObject=>{
                this.merge(kopnikAsObject);
                return this;
            });
    }

    onlineTimer_tick(){
        this.updateLastActiveTime();
    }

    beOnline(){
        this.onlineTimer.start();
        return this.updateLastActiveTime();
    }

    /**
     *  вливает новое состояние в объект и вызывает события
     */
    merge(json){
        var prevState= {};
        Object.assign(prevState, this);

        this._isLoaded= true;

        this.email= json.email;
        this.name= json.name;
        this.surname= json.surname;
        this.patronymic= json.patronymic;
        this.birth= json.birth;
        this.isOnline= json.isOnline;
    }
}

Kopnik.Status= {
    Offline: -1,
    Online: 1
};

Kopnik.OFFLINE_INTERVAL=5000;

module.exports= Kopnik;