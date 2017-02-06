/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict";

var assert = require('chai').assert
let _ = require("lodash")

let connection = require("../../../../src/Connection").default.getUnitTestInstance()
let Cleaner = require("../../../../src/Cleaner")
var models = require("../../../../src/model")

let KOPNIK = 2,
  KOPNIK2 = 2,
  KOPNIK3 = 3,
  ZEMLA = 2,
  ZEMLA2 = 2,
  ZEMLA3 = 3,
  KOPA = 3,
  PREDLOZHENIE = 1,
  predlozhenie

describe('Predlozhenie', function () {
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

  after(function (done) {
    connection.onclose = function (session, details) {
      done()
    }
    connection.close()
  })

  describe("#za, #protiv props", function () {
    let somePredlozhenie = new models.Predlozhenie()

    it('should be undefined on new', async function () {
      assert.equal(somePredlozhenie.za, undefined, "someKopnik.za, undefined");
      assert.equal(somePredlozhenie.protiv, undefined, "someKopnik.protiv, undefined");
    })
    it('should be 1 #za and 1 #protiv', async function () {
      somePredlozhenie.golosa = [{value: 1}, {value: -1}]
      assert.equal(somePredlozhenie.za.length, 1, "")
      assert.equal(somePredlozhenie.protiv.length, 1, "")
    })
  })

  describe('#create()', async function () {
    let predlozhenie,
      predlozhenieValue = `temp predlozhenie` + new Date().getTime()

    it('должен опубликовать "kopa.id3.predlozhenieAdd"', function (done) {
      (async() => {
        try {
          let kopnik = models.Kopnik.getReference(KOPNIK);
          let kopa = await models.Kopa.get(KOPA);

          await connection.session.subscribe(`api:model.Kopa.id${KOPA}.predlozhenieAdd`, async function (args) {
            try {
              predlozhenie = await models.Predlozhenie.get(args[0]);
              assert.equal(predlozhenie.owner.id, KOPNIK2, "predlozhenie.owner.id, KOPNIK2");
              done();
            }
            catch (err) {
              done(err);
            }
          });

          predlozhenie = await models.Predlozhenie.create({
            place: kopa,
            value: predlozhenieValue,
            owner: kopnik,
          });
        }
        catch (err) {
          done(err);
        }
      })()
    })
  })
})
