/**
 * Created by alexey2baranov on 8/26/16.
 */
"use strict";

let _ = require("lodash");
let assert = require('chai').assert;
let AutobahnConnection = require("autobahn").Connection
let Cookies= require("js-cookie")

import Connection from '../../../src/Connection'
let config = require("../../../cfg/main")[process.env.NODE_ENV];

describe('Connection', function () {
  let connection

  after(function () {
      return new Promise((res) => {
        if (Connection.getInstance().isOpen) {
          Connection.getInstance().onclose = function () {
            res()
          }
          Connection.getInstance().close();
        }
        else {
          res()
        }
      })
        .then(() => {
          return new Promise((res) => {
            if (Connection.getAnonymousInstance().isOpen) {
              Connection.getAnonymousInstance().onclose = function () {
                res()
              }
              Connection.getAnonymousInstance().close();
            }
            else {
              res()
            }
          })
        })
    }
  )

  it('getInstance()', function () {
    connection = Connection.getUnitTestInstance()

    expect(connection).instanceof(Connection)
    expect(Connection.getInstance()).equal(connection)
  })

  it('#open(kopnik)', function (done) {
    connection.onopen = (session, details) => {
      if (details.authrole == "kopnik") {
        done()
      }
      else {
        done(details.authrole + " != kopnik ")
      }
    }

    connection.open()
  })

  it('#close()', function (done) {
    connection.onclose = () => done()

    connection.close()
  });

  it('#open(anonymous)', function (done) {
    let anonymousConnection = Connection.getAnonymousInstance()
    anonymousConnection.onopen = (session, details) => {
      try {
        /**
         * 2.1 проверил
         * удалил куки ананимуса чтобы последующие заходы не считались сервером анонимусами
         */
        if (details.authrole == "anonymous") {
          Cookies.remove("cbtid")
          anonymousConnection.onclose = null
          // 3. закрыл
          anonymousConnection.close();;
          done()
        }
        // 2.2 открылось хуй пойми что
        else {
          done(details.authrole + " != anonymous");
        }
      }
      catch(err){
        done(err)
      }
    }
    //2.1 соединение не открылось
    anonymousConnection.onclose = (reason, data) => done(reason)
    //1. открыл
    anonymousConnection.open()
  })

  it('#connect() + #connect(coockie)', function (done) {
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
            if (details.authrole == "kopnik" && details.authid == config.unittest2.username) {
              done();
            }
            else {
              done(details.authrole+" != role")
            }
          }
          cookieConnection.onclose = (reason, details) => {
            done("cookie connection close with " + reason + JSON.stringify(details));
          }
          //3. reopen()
          cookieConnection.open();;
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
