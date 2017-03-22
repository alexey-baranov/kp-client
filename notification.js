/**
 * Created by alexey2baranov on 02.03.17.
 */
navigator.serviceWorker.register('service-worker.js', {scope: './'})
  .then(function (reg) {
    // регистрация сработала

    navigator.serviceWorker.addEventListener("message", function(e) {
      console.log(e.data)
    })

    navigator.serviceWorker.controller.postMessage(new Date)

  })
  .catch(function (error) {
    // регистрация прошла неудачно
    alert('Registration failed with ' + error);
  });
//
// navigator.serviceWorker.addEventListener('message', function(e) {
//   console.log("message form service worker", e.data);
// })

/*(async() => {
  Notification.requestPermission((permission) => {
    console.log(permission)
  })
  // let registration =await navigator.serviceWorker.register('service-worker.js?1', {scope: './'})
})()*/
