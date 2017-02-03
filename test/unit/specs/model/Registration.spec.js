/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict"

let _ = require("lodash")

import models from "../../../../src/model"
let Registration = require('../../../../src/model/Registration')
let Cleaner = require("../../../../src/Cleaner")
let connection = require("../../../../src/Connection").default.getUnitTestInstance()


/**
 * жду когда initZemla() вернет подходящую иерархию
 */
describe('Registration', function () {
  let registration = new Registration(),
    COUNTRY,
    TOWN,
    STREET

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
  });

  it('#create()', function (done) {
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
          email: "unit@unit.unit",
          password: "unit",
          name: "unit",
          surname: "temp",
          patronymic: "temp",
          birth: 1983,
          passport: "1234",
          dom: models.Zemla.getReference(2),
        });
      }
      catch (err) {
        done(err);
      }
    })()
  })
})
