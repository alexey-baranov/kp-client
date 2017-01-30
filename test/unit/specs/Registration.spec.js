/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict";

let _ = require("lodash");

import models from "../../../src/model"
import Registration from '../../../src/Registration'
let config = require("../../../cfg/main")[process.env.NODE_ENV]

describe('Registration', function () {
  let registration= new Registration(),
    COUNTRY,
    TOWN,
    STREET

  after(function () {
      return registration.disconnect()
    }
  )

  it('#connect()', async function () {
    await registration.connect()
  })

  it('#getCountries()', async function () {
    let countries= await registration.getCountries("Р")
    let countriestLowerCase= await registration.getCountries("р")
    expect(countries).a("array")
    expect(countries[0].name).equal("Россия")

    expect(countriestLowerCase).eql(countries)

    COUNTRY=countries[0].id
  })

  it('#getTowns()', async function () {
    this.timeout(2000)
    let towns= await registration.getTowns("с", COUNTRY)

    expect(towns).a("array")

    TOWN=towns[0].id
  })

  it('#getStreets()', async function () {
    let streets= await registration.getStreets("у", TOWN)
    expect(streets).a("array")
    expect(streets[0].name.substring(0,1)).equal("у")

    STREET=streets[0].id
  })


  it('#getHouses()', async function () {
    let houses= await registration.getHouses("1", STREET)
    expect(houses).a("array")
    expect(houses[0].name.substring(0,1)).equal("1")
  })

  it('#send()', async function () {

    registration.kopnik.email= "unit@unit.unit"
    registration.kopnik.password= "unit"
    registration.kopnik.password2= "unit"

    registration.kopnik.name= "unit"
    registration.kopnik.surname = "temp"
    registration.kopnik.patronymic= "temp"
    registration.kopnik.birth= 1983
    registration.kopnik.dom= models.Zemla.getReference(100)
    let result= await registration.send()

    expect(result).ok()
  })
})
