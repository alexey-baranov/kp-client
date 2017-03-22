/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict"

var assert = require('chai').assert
let _ = require("lodash")

let connection = require("../../../../src/Connection").default.getUnitTestInstance()
var models = require("../../../../src/model")
let Cleaner = require("../../../../src/Cleaner")

let KOPNIK = 2,
  KOPNIK2 = 2,
  PREDLOZHENIE = 1,
  golos

describe('Golos', function () {
  before(function () {
    this.timeout(5000)
    models.RemoteModel.clearCache()
    return new Promise(function (res, rej) {
      connection.onopen = function (session, details) {
        session.prefix('api', 'ru.kopa')
        res()
      }
      connection.open()
    })
      .then(function () {
        return Cleaner.clean()
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

  describe('#create()', function (){
    it('should throw error', function (done) {
      (async function () {
        try {
          golos = await models.Golos.create({
            subject: models.Predlozhenie.getReference(PREDLOZHENIE),
            value: 1,
            owner: models.Kopnik.getReference(KOPNIK2),
          })
          done(new Error("golos was created"))
        }
        catch (err) {
          done()
        }
      })()
    })
  })
})
