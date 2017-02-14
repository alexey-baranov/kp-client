/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict"

let _ = require("lodash")

let config = require("../../../cfg/main")[process.env.NODE_ENV]
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

  /**
   * эти ошибки не ловятся даже в карме внутри хрома
   */
  it.skip('#should handle unhandled Error', function () {
    grumbler.addEventHandler();
    setTimeout(()=>{
      throw new Error("qwerty")

      expect(grumbler.currentErrorType).equal("Error", "currentErrorType")
      expect(grumbler.currentErrorMessage).equal("qwerty", "currentErrorMessage")
      expect(grumbler.currentErrorStack).ok;
    },1)
  })

})
