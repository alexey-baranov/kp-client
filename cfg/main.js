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
      host: "localhost",
      port: "8484",
      "upload-path": "upload",
      "download-path": "download"
    },
    unittest2: {
      username: "unittest2@domain.ru",
      password: "qwerty"
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
  }
}

if (!process.env.NODE_ENV){
  throw new Error("NODE_ENV is not defined")
}

let privateConfig= require("./private")
let mergedConfig= require("lodash").merge({}, config, privateConfig)[process.env.NODE_ENV]


export default mergedConfig
