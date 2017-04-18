/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict"

let _ = require("lodash")

import Application from '../../../src/Application'
let config = require("../../../cfg/main").default
let connection = require("../../../src/Connection").default.getUnitTestInstance()
import models from "../../../src/model"

describe('Application', function () {
  let application = Application.getInstance()


  before(function () {
    return new Promise(function (res, rej) {
      connection.onopen = function (session, details) {
        session.prefix('api', 'ru.kopa');
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

  describe.skip("deprecated: notifications", function () {
    this.timeout(5000)
    let kopa

    before(async ()=>{
      kopa = await models.Kopa.create({
        question: "unit test application.on(predlozhenieAdd, slovoAdd, ...)",
        place: models.Zemla.getReference(2),
        owner: models.Kopnik.getReference(2),
      })
      await kopa.invite()
      await application.subscribeToNotifications()
    })

    it('on(kopaAdd, ...)', function (done) {
      (async() => {
        application.once(models.Zemla.event.kopaAdd, (local) => {
          expect(local).instanceof(models.Kopa)
          done();
        })

        let kopa = await models.Kopa.create({
          question: "unit test application.on(kopaAdd, ...)",
          place: models.Zemla.getReference(2),
          owner: models.Kopnik.getReference(2),
        })
        await kopa.invite()
      })()
    })

    it('on(predlozhenieAdd, ...)', function (done) {
      application.once(models.Kopa.event.predlozhenieAdd, (local) => {
        expect(local).instanceof(models.Predlozhenie)
        done()
      })

      models.Predlozhenie.create({
        value: "unit test application.on(predlozhenieAdd, ...)",
        place: kopa,
        owner: models.Kopnik.getReference(2),
      })
    })

    it('on(slovoAdd, ...)', function (done) {
      application.once(models.Kopa.event.slovoAdd, (local) => {
        expect(local).instanceof(models.Slovo)
        done()
      })

      models.Slovo.create({
        value: "unit test application.on(slovoAdd, ...)",
        place: kopa,
        owner: models.Kopnik.getReference(2),
      });
    })

  })

  it('should update push subscription', async function () {
    await Application.getInstance().addPushSubscription()
  })
})
