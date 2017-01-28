/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict";

let assert = require('chai').assert;
let _ = require("lodash");
import Vue from 'vue'

import Application from '../../../src/Application'
import applicationView from '../../../src/view/application.vue'
import models from '../../../src/model'
import StateManager from '../../../src/StateManager'

let config = require("../../../cfg/main")[process.env.NODE_ENV];

describe('StateManager', function () {
  let stateManager

  beforeEach(() => {
    applicationView.data = {
      id: "a",
      model: new Application()
    }

    stateManager = new StateManager(new Application(), new Vue(applicationView))
  })

  after(function () {
      return;
      return new Promise((res) => {
        Connection.getConnection().onclose = function () {
          res()
        }
        Connection.getConnection().close();
      })
    }
  )

  it('#getState()', function () {
    stateManager.application.state = Application.State.Main
    stateManager.application.body = models.Kopnik.getReference(1)

    const state = stateManager.getState()

    expect(state).a("object", "state")
    expect(state.a).a("object", "state.a")
    expect(state.a.state).equal(Application.State.Main, "state.a.state")
    expect(state.a.bodyType).equal("Kopnik", "state.a.bodyType")
    expect(state.a.BODY).equal(1, "state.a.BODY")
  })

  it('#setState()', function () {
    stateManager.popState({
      a:{
        state: Application.State.Main,
        bodyType: "Kopnik",
        BODY: 1
      },
      v:"av"
    })

    let application= stateManager.application
    expect(application.state).equal(Application.State.Main, "stateManager.application.state")
    expect(application.body).instanceof(models.Kopnik, "stateManager.application.body")
    expect(application.body.id).equal(1, "stateManager.application.body.id")
  })
});
