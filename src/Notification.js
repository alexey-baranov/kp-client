/**
 * Created by alexey2baranov on 06.02.17.
 */

export default class Notification{
  constructor(value, delay= Notification.defaultDelay){
    this.value= (value instanceof Object)?JSON.stringify(value):value

    this.delay= delay
  }
}

Notification.defaultDelay= 2000
