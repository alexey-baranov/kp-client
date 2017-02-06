/**
 * Created by alexey2baranov on 06.02.17.
 */
import Notification from './Notification'

export default class Notifier{
  constructor(){
    this.notifications= []
    this.timeout= undefined
  }

  static getInstance(){
    if (!Notifier.instance){
      Notifier.instance= new Notifier()
    }
    return Notifier.instance
  }

  get empty(){
    return !this.notifications.length
  }

  /**
   *
   * @param {Notification} notification
   */
  pushNotification(notification, delay=Notification.defaultDelay){
    if (!(notification instanceof Notification)){
      notification= new Notification(notification, delay)
    }

    this.notifications.push(notification)
    if (!this.timeout){
      this.shiftAfterTimeout()
    }
  }

  shiftAfterTimeout(){
    this.timeout= setTimeout(()=>{
      this.timeout= undefined
      this.notifications.shift()
      if (!this.empty) {
        this.nextAfterTimeout()
      }
    }, this.notifications[0].delay)
  }
}

