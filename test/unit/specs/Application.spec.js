/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict"

let _ = require("lodash")

import Application from '../../../src/Application'
let config = require("../../../cfg/main")[process.env.NODE_ENV]
let connection = require("../../../src/Connection").default.getUnitTestInstance()
import models from "../../../src/model"

describe('Application', function () {
  let application = Application.getInstance()


  before(function () {
    return new Promise(function (res, rej) {
      connection.onopen = function (session, details) {
        session.prefix('api', 'ru.kopa')
        res()
      }
      connection.open()
    })
  })

  after(function () {
    return new Promise(function (res, rej) {
      connection.onclose = function (session, details) {
        res()
      }
      connection.close()
    })
  })

  describe("notifications", function () {
    let kopa

    it('on(kopaAdd, ...)', function (done) {
      application.once(models.Zemla.event.kopaAdd, (localKopa) => {
        expect(localKopa).instanceof(models.Kopa)
        /**
         * задаю здесь глобальную копу для всех следующих тестов()
         * потому что событие может ывзваться и следующий тест начаться раньше,
         * чем выполнится await Kopa.create()
         */
        // kopa = localKopa
        done()
      });


      (async() => {
        // await application.registerServiceWorker()
        await application.subscribeToNotifications()

        kopa= await models.Kopa.create({
          question: "unit test application.on(kopaAdd, ...)",
          place: models.Zemla.getReference(2),
          owner: models.Kopnik.getReference(2),
        })
        await kopa.invite();;;;;;;;;
      })()


    })

  })

})
