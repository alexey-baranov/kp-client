/**
 * Created by alexey2baranov on 5/6/16.
 */

class EntityManager {
    static getInstance() {
        if (!EntityManager.instance) {
            EntityManager.instance = new EntityManager();
        }
        return EntityManager.instance;
    }

    constructor() {
        this.data = new Map([
            ["Kopnik", new Map()],
            ["Invite", new Map()],
            ["Room", new Map()],
            ["Queue", new Map()]
        ]);
    }

    merge(entity) {
        this.data.get(entity.constructor.name).set(entity.id, entity);
    }

    /**
     * Синхронный метод, устанавливает только id
     * и добавляет в репозиторий объектов
     * @param className
     * @param id
     * @returns {*}
     */
    getReference(className, id){
        if (!id) {
            throw new Error("Не указан идентификатор объекта id=" + JSON.stringify(id));
        }
        if (!this.data.get(className).has(id)) {
            var reference= null;
            switch(className) {
                case "Kopnik":
                    reference= new Kopnik();
                    break;
                case "Invite":
                    reference= new Invite();
                    break;
                case "Room":
                    reference= new Room();
                    break;
                case "Queue":
                    reference= new Queue();
                    break;
                default:
                    throw new Error("Неправильный тип объекта "+className);
            }
            reference.id= id;
            reference._isLoaded= false;

            this.data.get(className).set(id, reference);
        }
        return this.data.get(className).get(id);
    }

    find(className, id){
        if (this.data.get(className).has(id)) {
            var result= this.data.get(className).get(id);
            if (result._isLoaded) {
                return Promise.resolve(result);
            }
            else{
                return result.refresh();
            }
        }
        else {
            let entity = this.getReference(className, id);
            return entity.refresh();
        }
    }
}

module.exports= EntityManager;

var WS= require("./WS");
var Kopnik= require("./Kopnik");
var Room= require("./Room");
var Invite= require("./Invite");
var Queue= require("./Queue");

console.log(234);