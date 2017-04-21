/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict"

let _ = require("lodash")

let config = require("../../../cfg/main").default
let connection = require("../../../src/Connection").default.getUnitTestInstance()
import Grumbler from '../../../src/Grumbler'

describe('Grumbler', function () {
  let grumbler

  before(function () {
    return new Promise(function (res, rej) {
      connection.onopen = function (session, details) {
        session.prefix('api', 'ru.kopa')
        res()
      }
      connection.open()
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

  beforeEach(() => {
    grumbler = new Grumbler()
    // grumbler.log.setLevel("silent")
  })

  it('#should push Error', function () {
    try {
      throw new Error("qwerty")
    }
    catch (err) {
      grumbler.pushError(err)

      expect(grumbler.currentErrorType).equal("Error", "currentErrorType")
      expect(grumbler.currentErrorMessage).equal("qwerty", "currentErrorMessage")
      expect(grumbler.currentErrorStack).ok;
    }
  })

  describe("push tag", () => {
    let error1,error2, error3, error4

    before(() => {
      Grumbler.getInstance().errors=[]
      error1 = new Error("1")
      error2 = new Error("2")
      error2.tag = "tag"
      error3 = new Error("3")
      error4 = new Error("4")
      error4.tag = "tag"

      Grumbler.getInstance().pushError(error1)
      Grumbler.getInstance().pushError(error2)
      Grumbler.getInstance().pushError(error3)
      Grumbler.getInstance().pushError(error4)
    })

    it('#should remove prev tagged Error', function () {
      expect(Grumbler.getInstance().errors.indexOf(error2)).equal(-1)
    })
    it('#should not remove other Errors', function () {
      expect(Grumbler.getInstance().errors.length).equal(3)
    })
  })

  it('#should push AutobahnError', async function () {
    try {
      await connection.session.call("api:error", ["qwerty"])
    }
    catch (err) {
      grumbler.pushError(err)

      expect(grumbler.currentErrorType).equal("MySuperError", "currentErrorType")
      expect(grumbler.currentErrorMessage).equal("qwerty", "currentErrorMessage")
      expect(grumbler.currentErrorStack).ok;
    }
  })

  it('#should remove error', function () {
    let error = new Error("123")

    Grumbler.getInstance().pushError(error)
    Grumbler.getInstance().removeError(error)
    expect(Grumbler.getInstance().errors.indexOf(error)).equal(-1)
  })
  it('#should not throw error when remove foreign error', function () {
    Grumbler.getInstance().removeError(new Error("123"))
  })


  /**
   * эти ошибки не ловятся даже в карме внутри хрома
   */
  it.skip('#should handle unhandled Error', function () {
    grumbler.addEventHandler();
    setTimeout(() => {
      throw new Error("qwerty")

      expect(grumbler.currentErrorType).equal("Error", "currentErrorType")
      expect(grumbler.currentErrorMessage).equal("qwerty", "currentErrorMessage")
      expect(grumbler.currentErrorStack).ok;
    }, 1)
  })


})
