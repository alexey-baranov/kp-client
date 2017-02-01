/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict"

let _ = require("lodash")

import Connection from "../../../src/Connection"
import models from "../../../src/model"
let Registration = require('../../../src/model/Registration')
let config = require("../../../cfg/main")[process.env.NODE_ENV]

describe('Registration', function () {
  let registration= new Registration(),
    COUNTRY,
    TOWN,
    STREET,
    connection = Connection.getUnitTestInstance()

  before(function () {
    return new Promise(function (res, rej) {
      Connection.getUnitTestInstance().onopen = function (session, details) {
        session.prefix('api', 'ru.kopa')
        res()
      }
      Connection.getUnitTestInstance().open()
    })
  })

  after(function () {
    return new Promise(function (res, rej) {
      Connection.getUnitTestInstance().onclose = function (session, details) {
        res()
      }
      Connection.getUnitTestInstance().close()
    })
  })

  it.skip('#getCountries()', async function () {
    let countries = await registration.getCountries("Р")
    let countriestLowerCase = await registration.getCountries("р")
    expect(countries).a("array")
    expect(countries[0].name).equal("Россия")

    expect(countriestLowerCase).eql(countries)

    COUNTRY = countries[0].id
  })

  it.skip('#getTowns()', async function () {
    this.timeout(2000)
    let towns = await registration.getTowns("с", COUNTRY)

    expect(towns).a("array")

    TOWN = towns[0].id;
  })

  it.skip('#getStreets()', async function () {
    let streets = await registration.getStreets("у", TOWN)
    expect(streets).a("array")
    expect(streets[0].name.substring(0, 1)).equal("у")

    STREET = streets[0].id
  })


  it.skip('#getHouses()', async function () {
    let houses = await registration.getHouses("1", STREET)
    expect(houses).a("array")
    expect(houses[0].name.substring(0, 1)).equal("1")
  })

  it('#create()', function (done) {
    (async ()=>{
      try {
        await connection.session.subscribe(`api:model.Kopnik.id2.registrationAdd`, async function (args) {
          try {
            done()
          }
          catch(err){
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
      catch(err){
        done(err);
      }
    })()
  })
})
