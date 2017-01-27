/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict";

let assert = require('chai').assert;
let _ = require("lodash");

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
    let
      authid = config.unittest2.username,
      onchallenge = ()=>config.unittest2.password

    connection = Connection.getInstance({authid: authid, onchallenge: onchallenge})

    expect(connection).instanceof(Connection)
    expect(Connection.getInstance()).equal(connection)

    expect(connection._options.authid).equal(authid)
    expect(connection._options.onchallenge).equal(onchallenge)
  })

  it('#connect()', function (done) {
    connection.onopen= ()=>done()

    connection.open();
  })
});
