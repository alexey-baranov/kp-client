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
  KOPNIK3 = 3,
  ZEMLA = 2,
  ZEMLA2 = 2,
  ZEMLA3 = 3,
  KOPA = 3,
  slovo

describe('Slovo', function () {
  before(function () {
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

  describe('#create()', async function () {
    let slovoValue = "temp some Slovo"

    it('должен опубликовать "kopa.id3.slovoAdd"', function (done) {
      (async() => {
        try {
          let kopnik = models.Kopnik.getReference(KOPNIK)
          let kopa = await models.Kopa.get(KOPA)
          let slovo

          await connection.session.subscribe(`api:model.Kopa.id${KOPA}.slovoAdd`, async function (args) {
            try {
              slovo = await models.Slovo.get(args[0])
              assert.equal(slovo.owner.id, KOPNIK2, "slovo.owner.id, KOPNIK2")
              done()
            }
            catch (err) {
              done(err)
            }
          })

          slovo = await models.Slovo.create({
            place: kopa,
            value: slovoValue,
            owner: kopnik,
          })
        }
        catch (err) {
          done(err)
        }
      })()

    })
  })

  describe('#get()', async function () {
    let slovo
    it('should load Slovo', async function () {
      slovo = await models.Slovo.get(1)
      assert.equal(slovo instanceof models.Slovo, true)
    })

    it('should have created Date', function () {
      assert.equal(slovo.created instanceof Date, true)
    })
  })
})
