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
    connection.onopen = (session, details) => {
      if (details.authrole == "kopnik") {
        done()
      }
      else {
        done("role=" + details.authrole)
      }
    }

    connection.open()
  })

  it('#close()', function (done) {
    connection.onclose = () => done()

    connection.close()
  });

  it('#connect(anonimus)', function (done) {
    let anonymousConnection = Connection.getAnonymousInstance()
    anonymousConnection.onopen = (session, details) => {
      if (details.authrole == "anonymous") {
        anonymousConnection.onclose = null
        anonymousConnection.close()
        done()
      }
      else {
        done("role=" + details.authrole)
      }
    }
    anonymousConnection.onclose = (reason, data) => done(reason)

    anonymousConnection.open()
  })

  it.skip('#connect() + #connect(coockie)', function (done) {
    connection = Connection.getUnitTestInstance()
    connection.onopen = (session, details) => {
      if (details.authrole == "kopnik") {
        connection.onclose = () => {
          let cookieConnection = new Connection({
            authid: "123",
            onchallenge: function (session, method, extra) {
              return "123"
            }
          })
          cookieConnection.onopen = (session, details) => {
            if (details.authrole == "kopnik" && details.authid== config.unittest2.username) {
              done();
            }
            else {
              done("role=" + details.authrole)
            }
          }
          cookieConnection.onclose = (reason, details) => {
              done("cookie connection close with "+reason+JSON.stringify(details));
          }
          //3. reopen()
          cookieConnection.open();
        }
        //2. close()
        connection.close()
      }
      else {
        done("role=" + details.authrole)
      }
    }
    //1. open()
    connection.open()
  })
});
