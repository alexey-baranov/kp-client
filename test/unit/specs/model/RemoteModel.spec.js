/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict"; //my use strict
var assert = require('chai').assert;
var expect = require('chai').expect;

require("chai").use(require("chai-as-promised"))
let autobahn = require("autobahn");
let _ = require("lodash");

let connection = require("../../../../src/Connection").default.getUnitTestInstance()
let Cleaner = require("../../../../src/Cleaner")
var models = require("../../../../src/model")

let KOPNIK2 = 2;
let KOPNIK3 = 3;
let ZEMLA2 = 2;
let ZEMLA3 = 3;
let KOPA = 3;

describe('RemoteModel', function () {
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

  let kopa = null

  describe('#getReference()', function () {
    it('should return Kopnik reference', function () {
      let kopnik1 = models.Kopnik.getReference(KOPNIK2)
      assert.equal(true, kopnik1 instanceof models.Kopnik)
      assert.equal(KOPNIK2, kopnik1.id)
      assert.equal(false, kopnik1._isLoaded)
      assert.equal(kopnik1, models.Kopnik.getReference(KOPNIK2))
    })
  })

  describe('#get()', function () {
    let kopnik2 = null
    // this.timeout(5000)
    it('should return loaded Kopnik Unit Test', async function () {
      // throw new Error(123)
      kopnik2 = await models.Kopnik.get(KOPNIK2)

      assert.equal(kopnik2 instanceof models.Kopnik, true, "kopnik2 instanceof models.Kopnik")
      assert.equal(kopnik2.name, "Unit", "kopnik2.name, Unit")
      assert.equal(kopnik2._isLoaded, true, "kopnik2._isLoaded, true")
      assert.equal(_.isArray(kopnik2.attachments), true, "_.isArray(kopnik2.attachments), true")
    })

    it("2'nd call should return equal object", async function () {
      let sameKopnik = await models.Kopnik.get(KOPNIK2)
      assert.equal(sameKopnik, kopnik2, "sameKopnik, kopnik2")
    })

    it("should return equal as #getReference()", async function () {
      let localKopnik = await models.Kopnik.get(KOPNIK2)
      assert.equal(localKopnik, models.Kopnik.getReference(KOPNIK2))
    })

    it("should return kopa with attachments", async function () {
      let kopa = await models.Kopa.get(3)
      assert.equal(_.isArray(kopa.attachments), true, "_.isArray(kopa.attachments)")
      assert.equal(kopa.attachments[0] instanceof models.File, true, "kopa.attachments[0] instanceof models.File")
    })
  })

  describe('#getPlain()', function () {
    it("should return same value for plain properties", function () {
      let value = {string: "123", number: 123, date: new Date()}
      let plain = models.RemoteModel.getPlain(value)
      assert.equal(value.string, plain.string)
      assert.equal(value.number, plain.number)
      assert.equal(value.date, plain.date)
    })

    it('should return ids for reference and models', async function () {
      let value = {reference: models.Kopnik.getReference(KOPNIK2), model: await models.Kopnik.get(KOPNIK3)}
      let plain = models.RemoteModel.getPlain(value)
      assert.equal(plain.reference_id, KOPNIK2)
      assert.equal(plain.model_id, KOPNIK3)
    })

    it('should return Array<id> for arrays', async function () {
      let value = {array: [models.Kopnik.getReference(KOPNIK2), await models.Kopnik.get(KOPNIK3)]}
      let plain = models.RemoteModel.getPlain(value)
      assert.equal(plain.array[0], KOPNIK2)
      assert.equal(plain.array[1], KOPNIK3)
    })
  })

  describe('.create() (by Slovo)', function () {
    let slovo
    let slovoValue = "temp 123",
      slovoNote = "456"
    it("should create new Slovo with id, created, attachments", async function () {
      slovo = await models.Slovo.create({
        place: models.Kopa.getReference(KOPA),
        owner: models.Kopnik.getReference(KOPNIK2),
        value: slovoValue,
        note: slovoNote,
        attachments: [models.File.getReference(1), models.File.getReference(2)]
      })
      assert.equal(slovo instanceof models.Slovo, true, "instanceof")
      assert.equal(_.isNumber(slovo.id), true, "slovo.id")
      assert.equal(slovo._isLoaded, true, "slovo._isLoaded")
      assert.equal(slovo.created instanceof Date, true, "slovo.created is Date")
    })

    it('should be saved into database', async function () {
      await slovo.reload()
      assert.equal(slovo.place.id, KOPA, "slovo.place.id")
      assert.equal(slovo.owner.id, KOPNIK2, "slovo.owner.id")
      assert.equal(slovo.value, slovoValue, "slovo.value")
      assert.equal(slovo.note, slovoNote, "slovo.note")
      assert.equal(_.isArray(slovo.attachments), true, "_.isArray(slovo.attachments)")
      assert.equal(slovo.attachments.length, 2, "slovo.attachments.length, 2")
      assert.equal(slovo.attachments[0] instanceof models.File, true, "slovo.attachments[0] instanceof models.File")
    })

    it.skip('should publish event after create done', function (done) {
      (async() => {
        await connection.session.subscribe(`api:model.Kopa.id${KOPA}.slovoAdd`, function (args) {
          done()
          if (models.Slovo.getReference(args[0])._isLoaded) {
            done()
          }
          else {
            done(new Error(`api:model.Kopa.id${KOPA}.slovoAdd publicated before create done`))
          }
        })

        slovo = await models.Slovo.create({
          place: models.Kopa.getReference(KOPA),
          owner: models.Kopnik.getReference(KOPNIK2),
          value: "temp " + new Date().getTime(),
        });
      })()
    })
  })

  describe.only("#destroy", function(){
    let slovo,
      SLOVO

    before(async ()=>{
        slovo= await models.Slovo.create({
          value: "destroy unit test",
          owner: models.Kopnik.getReference(2),
          place: models.Kopa.getReference(1)
        })
        SLOVO= slovo.id
    })

    it("should destroy", async ()=>{
      expect(RemoteModel.cache.get("Slovo").has(SLOVO)).true
      await slovo.destroy()
    })

    it("should have undefined id", async ()=>{
      expect(slovo.id).undefined
    })

    it("should remove from RemoteModel.cache", async ()=>{
      await slovo.destroy()
      expect(RemoteModel.cache.get("Slovo").has(SLOVO)).false
    })

    it("should remove from database", async ()=>{
      let error= await expect(models.Slovo.get(SLOVO)).eventually.rejected
      expect(error.args[0]).match(/not found/i)
    })
  })

  describe('Zemla.save()', async function () {
    let zemla,
      zemlaNote = "unit test " + new Date().getTime()

    before(async function () {
      zemla = await models.Zemla.get(ZEMLA2)
    })

    it("should publicate event", function (done) {
      (async() => {
        try {
          await connection.session.subscribe("ru.kopa.model.Zemla.id2.change", function () {
            done()
          })

          zemla.note = zemlaNote
          await zemla.save()
        }
        catch (err) {
          done(err)
        }

      })()
    })

    it('should be saved into database', async function () {
      await zemla.reload()
      assert.equal(zemla.note, zemlaNote, "zemla.note")
    })

    it('should save attachments', async function () {
      let zemla = await models.Zemla.create({
        name: "unit test",
        parent: models.Zemla.getReference(1),
        attachments: [models.File.getReference(1), models.File.getReference(2)]
      })

      await zemla.reload()
      let file2 = zemla.attachments.find(each => each.id == 2)
      zemla.attachments.splice(zemla.attachments.indexOf(file2), 1)
      await zemla.save()
      await zemla.reload()

      assert.equal(zemla.attachments.length, 1, "zemla.attachments.length, 1")
      assert.equal(zemla.attachments[0] instanceof models.File, true, "zemla.attachments[0] instanceof models.File")
      assert.equal(zemla.attachments[0].id, 1, "zemla.attachments[0],id==1")
    })
  })

  it('.factory()', async function () {
    let kopnik2 = models.RemoteModel.factory("Kopnik:2")

    assert.equal(kopnik2 == models.Kopnik.getReference(2), true, "kopnik2 instanceof models.Kopnik");
  })
})
