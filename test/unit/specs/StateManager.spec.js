/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict";

let assert = require('chai').assert;
let _ = require("lodash");
import Vue from 'vue'

import Application from '../../../src/Application'
import applicationView from '../../../src/view/application.vue'
let connection = require("../../../src/Connection").default.getUnitTestInstance()
import models from '../../../src/model'
import StateManager from '../../../src/StateManager'

let config = require("../../../cfg/main")[process.env.NODE_ENV];

describe('StateManager', function () {
  let stateManager

  /**
   * Без ткрытого connection StateManager не установит stete=Main
   * вместо этого он перейдет в state=Auth
   */
  before(function () {
    models.RemoteModel.clearCache()
    return new Promise(function (res, rej) {
      connection.onopen = function (session, details) {
        session.prefix('api', 'ru.kopa')
        res()
      }
      connection.open()
    })
  })

  after(function () {
    if (connection.isOpen) {
      return new Promise(function (res, rej) {
        connection.onclose = function (session, details) {
          res()
        }
        connection.close()
      })
    }
  })

  beforeEach(() => {
    applicationView.propsDdata = {
      id: "a",
      model: new Application()
    }

    stateManager = StateManager.getInstance();
    stateManager.application= new Application()
    stateManager.applicationView= new Vue(applicationView)
  })

  it('#getState()', function () {
    stateManager.application.state = Application.State.Main
    stateManager.application.body = models.Kopnik.getReference(1)

    const state = stateManager.getState()

    expect(state).a("object", "state")
    expect(state.state).equal(Application.State.Main, "state.state")
    expect(state.body).equal("Kopnik:1", "state.body")
  })

  describe('#popState()', function () {
    it('should pop state', function () {
      stateManager.popState({
        state: Application.State.Main,
        body: "Kopnik:1",
        v: "av"
      })

      let application = stateManager.application
      expect(application.state).equal(Application.State.Main, "stateManager.application.state")
      expect(application.body).instanceof(models.Kopnik, "stateManager.application.body")
      expect(application.body.id).equal(1, "stateManager.application.body.id")
    })

    it('should redirect to Auth', function (done) {
      connection.onclose = function (session, details) {
        try {
          //2. попытался установить состояние Main
          stateManager.popState({
            state: Application.State.Main,
            body: "Kopnik:1",
            v: "av"
          })

          let application = stateManager.application
          expect(application.state).equal(Application.State.Auth, "stateManager.application.state")
          done()
        }
        catch (err) {
          done(err)
        }
      }
      //1. закрыл соединение
      connection.close()
    })
  })

});
