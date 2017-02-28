/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict";

var assert = require('chai').assert;
var models = require("../../../../src/model");
let _ = require("lodash");

let KOPNIK = 2,
  KOPNIK2 = 2,
  KOPNIK3 = 3,

  ZEMLA = 2,
  ZEMLA2 = 2,
  ZEMLA3 = 3,
  ZEMLA4 = 4,

  KOPA = 3,
  zemla;

let connection = require("../../../../src/Connection").default.getUnitTestInstance()
let Cleaner = require("../../../../src/Cleaner")

describe('Zemla', function () {
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

  describe('events', function () {
    let zemla

    it('Kopa#invite() should emit Zemla.event.kopaAdd, then RemoteModel.event.change', function (done) {
      (async() => {
        try {
          zemla = await models.Zemla.get(ZEMLA)

          //2. земля унала что создали копу
          zemla.once(models.Zemla.event.kopaAdd, (sender, kopa) => {
            try {
              assert.equal(kopa instanceof models.Kopa, true, "kopa instanceof models.Kopa, true");
              assert.equal(kopa.invited, null, "kopa.invited, null");

              //4. копа изменилась
              kopa.once(models.RemoteModel.event.change, () => {
                try {
                  assert.equal(kopa instanceof models.Kopa, true, "kopa instanceof models.Kopa, true")
                  assert.equal(zemla.kopi.length, 1, "zemla.kopi.length, 1")
                  done()
                }
                catch (err) {
                  done(err)
                }
              })
            }
            catch (err) {
              done(err)
            }
          })
          zemla.kopi = [];

          //1. создал
          let kopa = await models.Kopa.create({
            question: "temp",
            owner: models.Kopnik.getReference(KOPNIK),
            place: zemla,
          })
          //3. созвал
          await kopa.invite()
        }
        catch (err) {
          done(err)
        }
      })()
    })

    let someZemla1,
      someZemla2,
      zemla2

    /**
     * создаю две земли одна дочка другой
     * и на дочке создаю копника
     * прилетают два события сначала на дочке потом но матери
     */
    it('Kopnik#create() should emit Zemla.event.obshinaChange', function (done) {
      (async() => {
        try {
          someZemla1 = await models.Zemla.create({
            name: "temp1",
            parent: models.Zemla.getReference(ZEMLA2),
          })

          someZemla2 = await models.Zemla.create({
            name: "temp2",
            parent: someZemla1,
          })

          someZemla2.once(models.Zemla.event.obshinaChange, (sender) => {
            assert(sender.obshinaSize, 1);
          })

          someZemla1.once(models.Zemla.event.obshinaChange, (sender) => {
            assert(sender.obshinaSize, 1);
            done()
          })

          await models.Kopnik.create({
            email: "unittestR@domain.ru",
            name: "temp",
            surname: "temp",
            patronymic: "temp",
            birth: 1900,
            passport: "1234",
            dom: someZemla2,
          })
        }
        catch (err) {
          done(err)
        }
      })()
    })

    /**
     * перекидываю землю с дочкой на ZEMLA4
     * сначала прилетают события открепления общины
     * потом прикрепления
     */
    it('Zemla#setParent2() should emit obshinaChange down and up', function (done) {
      (async() => {
        try {
          let zemla2 = await models.Zemla.get(ZEMLA2)
          let zemla4 = await models.Zemla.get(ZEMLA4)

          /**
           * сначала прилетают события открепления общины
           * потом прикрепления
           */
          zemla2.once(models.Zemla.event.obshinaChange, () => {
            try {
              assert.equal(zemla2.obshinaSize, 5, "zemla2.obshinaSize, 5");
              zemla4.once(models.Zemla.event.obshinaChange, () => {
                try {
                  assert.equal(zemla4.obshinaSize, 2, "zemla4.obshinaSize, 2");
                  done();
                }
                catch (err) {
                  done(err);
                }
              });
            }
            catch (err) {
              done(err);
            }
          });
          someZemla1.setParent(zemla4);
        }
        catch (err) {
          done(err);
        }
      })()
    })
  })
})
