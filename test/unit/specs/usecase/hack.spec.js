/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict";

var assert = require('chai').assert;
var expect = require('chai').expect;

require("chai").use(require("chai-as-promised"))
var models = require("../../../../src/model");
let _ = require("lodash");

let connection = require("../../../../src/Connection").default.getUnitTestInstance()
let Cleaner = require("../../../../src/Cleaner")

describe('hack', function () {
  this.timeout(5000)
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

  it('should reject', async function () {
    await expect(Promise.reject(new Error("123"))).eventually.rejectedWith(Error, /2/)
    let error = await expect(Promise.reject({error: "Error",})).eventually.rejected.property("error", "Error")
  })

  //zemla, registration, kopnik, kopa, slovo, predlozhenie, golos, file
  it('should throw error when load registration', async function () {
    let error = await expect(models.Registration.get(8)).eventually.rejected
    expect(error.args[0]).match(/permission denied/i);;;;
  })

  it('should throw error when load foreign kopi', async function () {
    let zemla = await models.Zemla.get(4);

    let error = await expect(zemla.loadKopi()).eventually.rejected
    expect(error.args[0]).match(/permission denied/i);;;;
  })

  it('should throw error when load foreign kopa', async function () {
    let error = await expect(models.Kopa.get(8)).eventually.rejected
    expect(error.args[0]).match(/permission denied/i);;;
  });;

  it('should throw error when load foreign slovo', async function () {
    let error = await expect(models.Slovo.get(4)).eventually.rejected
    expect(error.args[0]).match(/permission denied/i);;;;
  })

  it('should throw error when load foreign predlozhenie', async function () {
    let error = await expect(models.Predlozhenie.get(4)).eventually.rejected
    expect(error.args[0]).match(/permission denied/i);;;;
  })

  it('should throw error when load foreign golos', async function () {
    let error = await expect(models.Golos.get(3)).eventually.rejected
    expect(error.args[0]).match(/permission denied/i);;;;;;;;;
  })

  it('should throw error when create foreign kopa', async function () {
    let error = await expect(models.Kopa.create({
      place: models.Zemla.getReference(4),
      question: "unit test foreign kopa create fail",
      owner: models.Kopnik.getReference(2)
    })).eventually.rejected

    expect(error.args[0]).match(/doesn't live into/i)
  })

})
