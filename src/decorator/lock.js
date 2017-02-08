/**
 * Created by alexey2baranov on 08.02.17.
 */

/**
 * Вызывает оригинальную функцию со своим контекстом и своими параметрами только один экземпляр
 * Если второй экземпляр функции запускается раньше, чем выполнился первый, то ошибка
 * @param original
 * @return {result}
 */
export default function (original) {
  function unlock() {
    result.locked = false;
  }

  function result () {
    var promise;
    if (result.locked) {
      promise = Promise.reject("lock() decorator: executing in progress");
    } else {
      result.locked = true;
      promise = original.apply(this, arguments);

      if (!(promise instanceof Promise)){
        throw new Error("lock() decorator works with async functions only")
      }

      promise.then(unlock, unlock);
    }
    return promise;
  }

  result.locked = false;

  return result
}
