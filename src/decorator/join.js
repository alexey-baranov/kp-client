/**
 * Created by alexey2baranov on 08.02.17.
 */

/**
 * Вызывает оригинальную функцию со своим контекстом и своими параметрами только один экземпляр
 * Все последующие вызовы ожидают завершения первого вызова и получают его результат
 * Порядок получения результатов такой же как они вызывали функцию
 *
 * @param decoratee
 * @return {result}
 */
export default function (decoratee) {
  /**
   * Результаты функции которые получат вызывальщики после ее выполнения
   * @type {Array}
   */
  let results = []

  function uncall() {
    results.length = 0
    decorated.called = false
  }

  function decorated() {
    if (arguments.length) {
      // return Promise.reject(new Error("Joined function could not have arguments"))
    }
    var result = new Promise(function (resolve, reject) {
      results.push({resolve, reject})
    })

    if (!decorated.called) {
      decorated.called = true
      let promise = decoratee.apply(this, arguments)

      if (!(promise instanceof Promise)) {
        throw new Error("join() decorator works with async functions only")
      }

      promise
        .then(result => {
            for (let eachResult of results) {
              eachResult.resolve(result)
            }
            uncall()
          },
          err => {
            for (let eachResult of results) {
              eachResult.reject(err)
            }
            uncall()
          })
    }
    return result
  }

  decorated.called = false;

  return decorated
}
