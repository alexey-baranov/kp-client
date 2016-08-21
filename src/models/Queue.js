/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var signals= require("signals");
var WS= require("./WS");
var RemoteEntity= require("./RemoteModel");

class Queue extends RemoteEntity {
    constructor() {
        super();
        /**
         * очередь готова для приема звонка или не готова для приема звонка
         */
        this.state= undefined;

        this.membersFirst = [];
        this.membersSecond = [];
        this.membersThird = [];
        
        this.stateChanged = new signals.Signal();
    }

    /**
     *  вливает новое состояние в объект и вызывает события
     */
    merge(json){
        var prevState= {};
        Object.assign(prevState, this);

        this._isLoaded= true;

        this.name= json.name;
        this.state= Number.parseInt(json.state);

        //membersFirst
        this.membersFirst= [];
        json.membersFirst.forEach((eachMemberShort)=>{
            var eachMember= EntityManager.getInstance().getReference("Kopnik", eachMemberShort.id);
            this.membersFirst.push(eachMember);
        });

        //membersSecond
        this.membersSecond= [];
        json.membersSecond.forEach((eachMemberShort)=>{
            var eachMember= EntityManager.getInstance().getReference("Kopnik", eachMemberShort.id);
            this.membersSecond.push(eachMember);
        });
        
        //membersThird
        this.membersThird= [];
        json.membersThird.forEach((eachMemberShort)=>{
            var eachMember= EntityManager.getInstance().getReference("Kopnik", eachMemberShort.id);
            this.membersThird.push(eachMember);
        });

        //сигналы
        if (prevState.state!== this.state){
            this.stateChanged.dispatch(this, prevState.state);
        }
    }
}

Queue.State={
    NotReady:0,
    Ready: 1
};

module.exports= Queue;

var EntityManager= require("./EntityManager");