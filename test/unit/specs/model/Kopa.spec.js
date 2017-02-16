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
  ZEMLA = 2,
  KOPA = 3


describe('Kopa', function () {
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

  let kopa = null;

  describe('#getReference()', function () {
    it("should return Kopa", function () {
      kopa = models.Kopa.getReference(KOPA)
      assert.equal(kopa instanceof models.Kopa, true)
    })
  })

  describe('#get()', function () {
    it('should return loaded Kopa', async function () {
      kopa = await models.Kopa.get(KOPA)
      assert.equal(kopa instanceof models.Kopa, true, "kopa instanceof models.Kopa")
      assert.equal(kopa.place instanceof models.Zemla, true)
      assert.equal(kopa._isLoaded, true)
      assert.equal(_.isArray(kopa.attachments), true)
    })
  })

  describe('#invite()', function () {
    let kopaQuestion = "temp some Kopa"

    it('должен опубликовать "zemla.id2.kopaAdd"', function (done) {
      (async() => {
        try {
          let kopnik = models.Kopnik.getReference(KOPNIK)
          let zemla = await models.Zemla.get(ZEMLA)
          let kopa

          //3. земля получает событие что созвана копа
          await connection.session.subscribe(`api:model.Zemla.id${ZEMLA}.kopaAdd`, async function (args) {
            try {
              //4. проверил что копа правильная
              kopa = await models.Kopa.get(args[0])
              assert.equal(kopa.owner.id, KOPNIK, "kopa.owner.id, KOPNIK2")
              done()
            }
            catch (err) {
              done(err)
            }
          })

          //1. создал копу (черновик)
          kopa = await models.Kopa.create({
            place: zemla,
            question: kopaQuestion,
            owner: kopnik,
          })
          //2. созвал копу
          kopa.invite()
        }
        catch (err) {
          done(err)
        }
      })()
    })
  })

  describe('#loadDialog()', function () {
    let result,
      kopa

    it("should return array of Slovo", async function () {
      kopa = await models.Kopa.get(KOPA)
      result = await kopa.loadDialog()

      assert.equal(_.isArray(result), true)
      for (var eachResult of result) {
        assert.equal(eachResult instanceof models.Slovo, true)
      }
    })

    it('size should be 3', function () {
      assert.equal(result.length, 3, "result.length, 3")
    })

    it('should be ordered by created', function () {
      assert.equal(result[0].created < result[1].created, true)
      assert.equal(result[1].created < result[2].created, true)
    })

    it("should prepend +1 Slovo", async function () {
      kopa.dialog.shift()
      result = await kopa.loadDialog()
      assert.equal(result.length, 3, "result.length, 3")
    })

    it('should prepend to begining', function () {
      assert.equal(result[0].created < result[1].created, true)
      assert.equal(result[1].created < result[2].created, true)
    })
  })

  describe('#loadResult()', function () {
    let result,
      kopa

    it("should return array of Predlozheniex", async function () {
      kopa = await models.Kopa.get(KOPA)
      result = await kopa.loadResult()

      assert.equal(_.isArray(result), true)
      for (var eachResult of result) {
        assert.equal(eachResult instanceof models.Predlozhenie, true)
      }
    })

    it('size should be 3', function () {
      assert.equal(result.length, 3, "result.length, 3")
    })

    it('should be ordered by created', function () {
      assert.equal(result[0].created < result[1].created, true)
      assert.equal(result[1].created < result[2].created, true)
    })

    it("should prepend +1 Predlozhenie", async function () {
      kopa.result.shift()
      result = await kopa.loadResult()
      assert.equal(result.length, 3, "result.length, 3")
    })

    it('should prepend to begining', function () {
      assert.equal(result[0].created < result[1].created, true)
      assert.equal(result[1].created < result[2].created, true)
    })
  })

  describe('events', async function () {
    let kopnik,
      kopa;

    it('Slovo.create() -> Kopa.emit(addSlovo)', function (done) {
      (async() => {
        try {
          kopnik = await models.Kopnik.get(KOPNIK)
          kopa = await models.Kopa.get(KOPA)

          kopa.dialog = []
          kopa.on(models.Kopa.event.slovoAdd, (sender, add) => {
            try {
              assert.equal(add instanceof models.Slovo, true, "add instanceof models.Slovo")
              assert.equal(sender.dialog[0], add, "sender.dialog[0], add")
              done()
            }
            catch (err) {
              done(err)
            }
          })

          let value = "temp " + new Date().getTime()
          let slovo = await models.Slovo.create({
            place: kopa,
            value: value,
            owner: kopnik,
          })
        }
        catch (err) {
          done(err)
        }
      })()

    })

    it('Predlozhenie.create() -> Kopa.emit(addPredlozhenie)', function (done) {
      (async() => {
        try {
          kopnik = await models.Kopnik.get(KOPNIK)
          kopa = await models.Kopa.get(KOPA)

          kopa.result = []
          kopa.on(models.Kopa.event.predlozhenieAdd, (sender, add) => {
            try {
              assert.equal(add instanceof models.Predlozhenie, true, "add instanceof models.Predlozhenie")
              assert.equal(sender.result[0], add, "sender.result[0], add")
              done()
            }
            catch (err) {
              done(err)
            }
          })

          let value = "temp " + new Date().getTime()
          let predlozhenie = await models.Predlozhenie.create({
            place: kopa,
            value: value,
            owner: kopnik,
          })
        }
        catch (err) {
          done(err);
        }
      })()
    })

    it.only('Predlozhenie.destroy() -> Kopa.emit(predlozhenieDestroy)', function (done) {
      (async() => {
        let predlozhenie
        try {
          kopnik = await models.Kopnik.get(KOPNIK)
          kopa = await models.Kopa.get(KOPA)

          kopa.result = []
          kopa.on(models.Kopa.event.predlozhenieDestroy, (sender, destroyed) => {
            try {
              assert.equal(destroyed, predlozhenie, "destroyed, predlozhenie")
              assert.equal(kopa.result.length, 0, "kopa.result.length, 0")

              done()
            }
            catch (err) {
              done(err)
            }
          })
          let predlozhenie = await models.Predlozhenie.create({
            place: kopa,
            value: "destroy unit test",
            owner: kopnik,
          })

          await predlozhenie.destroy();
        }
        catch (err) {
          done(err);
        }
      })()
    })
  })
})
