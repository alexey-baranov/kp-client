/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var signals= require("signals");
var WS= require("./WS");
var RemoteEntity= require("./RemoteModel");

class Invite extends RemoteEntity{
    constructor() {
        super();
        this.status = undefined;

        this.who = null;
        this.whom = null;
        this.where = null;

        //события
        this.statusChanged = new signals.Signal();
    }
    
    

    setStatus(value) {
        var oldValue = this.status;
        if (value !== oldValue) {
            this.status = value;
            this.statusChanged.dispatch(oldValue);
        }
    }

    refresh() {
        let inviteAsJson = null;
        let result = new WS()
            .call("entityManager.php/getInvite", {id: this.id})
            .then(inviteAsJsonLocal=> {
                inviteAsJson = inviteAsJsonLocal;
                // this.id= inviteAsJson.id;
                this._isLoaded = true;
                this.setStatus(inviteAsJson.status);

                //who
                this.who = EntityManager.getInstance().getReference("Invite", inviteAsJson.who.id);

                //whom
                this.whom = EntityManager.getInstance().getReference("Invite", inviteAsJson.whom.id);

                //where
                this.where = EntityManager.getInstance().getReference("Room", inviteAsJson.where.id);

                return this;
            });

        return result;
    }
}

Invite.Status = {
    Open: 0,
    Accepted: 1,
    Rejected: -1
};

module.exports= Invite;

var EntityManager= require("./EntityManager");