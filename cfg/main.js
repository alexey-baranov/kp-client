/**
 * Created by alexey2baranov on 8/20/16.
 */

let config = {
  "development": {
    WAMP: {
      schema: "ws",
      host: "localhost",
      port: "8080",
      path: "ws"
    },
    "file-server": {
      schema: "http",
      host: "kopnik.org",
      port: "8484",
      "upload-path": "upload",
      "download-path": "download"
    },
    unittest2: {
      username: "unittest2@domain.ru",
      password: "qwerty"
    },
    "captcha": {
      "key": "6Lf78hkUAAAAALDWSItQ9OdDXfM2ZM7JunDSQMuK",
    },
  },
  "testing": {
    WAMP: {
      schema: "ws",
      host: "localhost",
      port: "8080",
      path: "ws"
    },
    "file-server": {
      schema: "http",
      host: "localhost",
      port: "8484",
      "upload-path": "upload",
      "download-path": "download"
    },
    unittest2: {
      username: "unittest2@domain.ru",
      password: "qwerty"
    },
    "captcha": {
      "key": "6Lf78hkUAAAAALDWSItQ9OdDXfM2ZM7JunDSQMuK",
    },
  },
  "production": {
    WAMP: {
      schema: "wss",
      host: "kopnik.org",
      port: "443",
      path: "ws"
    },
    "file-server": {
      schema: "https",
      host: "kopnik.org",
      port: "443",
      "upload-path": "upload",
      "download-path": "download"
    },
    unittest2: {
      username: "unittest2@domain.ru",
      password: "qwerty"
    },
    "captcha": {
      "key": "6Le-9BMUAAAAAIx-D7vLPKysleUXNU6tzOlcX8Kr",
    },
  }
}

if (!process.env.NODE_ENV){
  throw new Error("NODE_ENV is not defined");
}

let privateConfig= require("./private")
let mergedConfig= require("lodash").merge({}, config, privateConfig)[process.env.NODE_ENV]


export default mergedConfig;
