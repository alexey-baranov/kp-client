/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict";

let _ = require("lodash");
let assert = require('chai').assert;
let AutobahnConnection = require("autobahn").Connection

import Connection from '../../../src/Connection'
let config = require("../../../cfg/main")[process.env.NODE_ENV];

describe('Connection', function () {
  let connection

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

  it('getInstance()', function () {
    connection = Connection.getUnitTestInstance()

    expect(connection).instanceof(Connection)
    expect(Connection.getInstance()).equal(connection)
  })

  it('#open()', function (done) {
    connection.onopen= ()=>done()

    connection.open();
  })

  it('#close()', function (done) {
    connection.onclose= ()=>done()

    connection.close()
  });

  it.skip('#connect(anonimus)', function (done) {
    let anonymousConnection= new AutobahnConnection({
      url: `${config.WAMP.schema}://${config.WAMP.host}:${config.WAMP.port}/${config.WAMP.path}`,
      realm: "kopa",
      authmethods: ['anonymous'],
    })
    anonymousConnection.onopen= ()=>done()
    anonymousConnection.onclose= (reason, data)=>done(data)

    anonymousConnection.open();
  })
});
