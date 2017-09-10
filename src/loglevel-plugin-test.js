/**
 * Created by alexey2baranov on 09.09.17.
 */

export default class {
  static hasToString(clas){
    if (clas.name=="Object" || !clas.prototype){
      return false
    }
    else {
      return clas.prototype.hasOwnProperty("toString") || this.hasToString(Object.getPrototypeOf(clas))
    }
  }

  static toString(value) {
    //если массив
    if (typeof value == "object" && value.constructor == Array) {
      return value.map(eachElement => {
        return this.toString(eachElement)
      })
    }
    //объект кроме массива
    else if (typeof value == "object" && this.hasToString(value.constructor)) {
      return value.toString()
    }
    //любой другой тип
    else {
      return value
    }
  }

  static apply(logger, options) {
    if (!logger || !logger.getLogger) {
      throw new TypeError('Argument is not a root loglevel object');
    }

    const originalFactory = logger.methodFactory
    logger.methodFactory = (methodName, logLevel, loggerName) => {
      const rawMethod = originalFactory(methodName, logLevel, loggerName)

      return (...args) => {
        let argsModifed = args.map(eachArg => this.toString(eachArg))
        rawMethod(...argsModifed)
      }
    }

    logger.setLevel(logger.getLevel())
    return logger
  }
}
