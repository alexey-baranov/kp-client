/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict"

let _ = require("lodash")
let Cookies = require("js-cookie")

import log from "../../../../src/log"
import models from "../../../../src/model"


let Registration = require('../../../../src/model/Registration')
let Cleaner = require("../../../../src/Cleaner")
let connection = require("../../../../src/Connection").default.getUnitTestInstance()
let anonymousConnection = require("../../../../src/Connection").default.getAnonymousInstance()


/**
 * жду когда initZemla() вернет подходящую иерархию
 */
describe('Registration', function () {
  let registration = new Registration(),
    COUNTRY,
    TOWN,
    STREET

  before(function () {
    models.RemoteModel.clearCache();
    return new Promise(function (res, rej) {
      anonymousConnection.onopen = function (session, details) {
        Cookies.remove("cbtid")
        session.prefix('api', 'ru.kopa')
        res()
      }
      anonymousConnection.open();
    })
      .then(function () {
        // connection= require("Connection").default.getUnitTestInstance();
        return new Promise(function (res, rej) {
          connection.onopen = function (session, details) {
            session.prefix('api', 'ru.kopa');
            res()
          }
          connection.open()
        })
      })
      .then(function () {
        return Cleaner.clean()
      })
  })

  after(function () {
    return new Promise(function (res, rej) {
      anonymousConnection.onclose = function (session, details) {
        res()
      }
      anonymousConnection.close()
    })
      .then(function () {
        return new Promise(function (res, rej) {
          connection.onclose = function () {
            res()
          }
          connection.close()
        })
      })
  })

  it('#getCountries()', async function () {
    let countries = await registration.getCountries("c")
    expect(countries).a("array")
    expect(countries[0].name).equal("Country1")
  })

  it('#getTowns()', async function () {
    this.timeout(2000)
    let towns = await registration.getTowns("t", 2)
    expect(towns).a("array")
    expect(towns[0].name.substring(0, 1)).equal("T")
  })

  it('#getStreets()', async function () {
    let streets = await registration.getStreets("s", 5)
    expect(streets).a("array")
    expect(streets[0].name.substring(0, 1)).equal("S")
  })

  it('#getHouses()', async function () {
    let houses = await registration.getHouses("h", 6)
    expect(houses).a("array")
    expect(houses[0].name.substring(0, 1)).equal("H")
  })

  it('#fill()', async function () {
    let registration= new Registration()
    await registration.fill()
    expect (+registration.dom.id).equal(7, "registration.dom.id")
    expect (registration.isReady()).ok
  })

  describe("#create()", function() {
    this.timeout(5000)
    it('registrationAdd', function (done) {
      (async() => {
        try {
          await connection.session.subscribe(`api:model.Kopnik.id2.registrationAdd`, async function (args) {
            try {
              done()
            }
            catch (err) {
              done(err)
            }
          })

          registration = await Registration.create({
            email: "alexey2baranov@gmail.com",
            password: "unit",
            name: "unit",
            surname: "temp",
            patronymic: "temp",
            birth: 1983,
            passport: "1234",
            dom: models.Zemla.getReference(2),
          })
        }
        catch (err) {
          done(err);
        }
      })()
    })

    it('verifier ok', async function () {
      registration = await Registration.create({
        email: "somebody@yandex.ru",
        password: "unit",
        name: "unit",
        surname: "temp",
        patronymic: "temp",
        birth: 1983,
        passport: "1234",
        dom: models.Zemla.getReference(2),
      })

      expect(registration.verifier.id).equal(2, "registration.verifier.id");
      expect(registration.verifier.name).equal("Unit", "registration.verifier.name")
      expect(registration.verifier.skype).equal("skype", "registration.verifier.skype");
      expect(registration.verifier.email).equal("unittest2@domain.ru", "registration.verifier.email")
      expect(registration.verifier.password).empty
    })
  })
})
