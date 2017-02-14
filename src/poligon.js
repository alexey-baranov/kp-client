/**
 * Created by alexey2baranov on 14.02.17.
 */

import configs from "./../cfg/main"

console.log(configs)

let config = configs[process.env.NODE_ENV]

console.log(config)


import models from './model'

import {RemoteModel, Kopnik} from './model'


console.log(RemoteModel.cache)
