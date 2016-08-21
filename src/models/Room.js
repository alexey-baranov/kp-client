/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var signals= require("signals");
var WS= require("./WS");
var RemoteEntity= require("./RemoteModel");

class Room extends RemoteEntity {
    constructor() {
        super();
        this.members = [];

        this.membersChanged = new signals.Signal();
    }

    setMembers(value) {
        let oldValue = this.members;
        let joinedMembers = [];
        let leavedMembers = [];

        //новые участники
        value.forEach(eachMember=> {
            if (oldValue.indexOf(eachMember) == -1) {
                joinedMembers.push(eachMember);
            }
        });

        //отсоединившиеся
        oldValue.forEach(eachOldMember=> {
            if (value.indexOf(eachOldMember) == -1) {
                leavedMembers.push(eachOldMember);
            }
        });

        if (leavedMembers.length || joinedMembers.length) {
            this.members = value;
            this.membersChanged.dispatch(joinedMembers, leavedMembers);
        }
    }


    refresh() {
        let roomAsJson = null;
        let result = new WS()
            .call("entityManager.php/getRoom", {id: this.id})
            .then(roomAsJsonLocal=> {
                roomAsJson = roomAsJsonLocal;

                this._isLoaded = true;
                this.name = roomAsJson.name;

                //members
                let members = roomAsJson.members.map(elem => {
                    return EntityManager.getInstance().getReference("Kopnik", elem.id);
                });
                this.setMembers(members);
                return this;
            });

        return result;
    }
}

module.exports= Room;

var EntityManager= require("./EntityManager");
