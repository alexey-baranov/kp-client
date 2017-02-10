/**
 * Created by alexey2baranov on 06.02.17.
 */
import Notification from './Notification'

export default class Notifier{
  constructor(){
    this.currentNotification = null
    this.error= []
    this.timeout= undefined
  }

  static getInstance(){
    if (!Notifier.instance){
      Notifier.instance= new Notifier()
    }
    return Notifier.instance
  }

  /**
   *
   * @param {Notification} notification
   * @param {Number} delay ms
   *
   */
  pushNotification(notification, delay=Notification.defaultDelay){
    if (!(notification instanceof Notification)){
      notification= new Notification(notification, delay)
    }

    this.error.push(notification)
    if (!this.timeout){
      this.shiftCurrentNotificatonUntilTimeout()
    }
  }

  /**
   * Установить на время пока не таймаут
   */
  shiftCurrentNotificatonUntilTimeout(){
    this.currentNotification= this.error.shift()
    this.timeout= setTimeout(()=>{
      this.currentNotification= null
      this.shiftCurrentNotificationAfterTimeout()
    }, this.currentNotification.delay)
  }

  /**
   * устанавливает следующий попловок после таймаута
   */
  shiftCurrentNotificationAfterTimeout(){
    //проверка происходит внутри таймаута
    //потому что за время пока идет таймаут может прилететь следующее уведомление
    //но оно не должно выстрелить раньше промежуточного интервала
      this.timeout = setTimeout(() => {
        if (!this.error.length){
          this.timeout= undefined
        }
        else{
          this.shiftCurrentNotificatonUntilTimeout()
        }
      }, Notifier.betweenDelay)
  }
}

Notifier.betweenDelay= 3000
