let version =   9
console.log(`service worker v.${version} pa    rsindsfsag....`)

self.addEventListener('install', event => {
  console.log(`service worker v.${version} installing and skipping waiting...`)
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', event => {
  console.log(`service worker v.${version} activating and claiming...`)
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', function(event) {
  console.log('Received a push message', event)

  var title = 'Yay a message.'
  var body = 'We have received a push message.'
  var icon = 'static/img/logo-small.png'

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: icon,
    })
  );
})

self.addEventListener('message', (e) => {
  switch (e.data.eventType) {
    case "kopaAdd":
      self.registration.showNotification('Все на копу!!', {
        body: e.data.data.question,
        tag: 'kopa:' + e.data.data.id,
        data: e.data,
        icon: "static/sw/kopaAdd.jpg",
        vabrate: [2000, 1000, 2000, 1000, 2000]
      })
      break
    case "predlozhenieAdd":
      self.registration.showNotification('Новое предложение', {
        body: e.data.data.value,
        tag: 'predlozhenie:' + e.data.data.id,
        data: e.data,
        icon: "static/sw/slovoAdd.png",
        vabrate: [200, 200, 200, 200, 500]
      })
      break
    case "slovoAdd":
      clients.matchAll({type: "window"})
        .then(windowClients => {
          console.log("window clients", windowClients)

          let focusedAndVisible
          for (let eachWindowClient of windowClients) {
            if (eachWindowClient.focused && eachWindowClient.visibilityState == "visible") {
              focusedAndVisible = eachWindowClient
              break
            }
          }

          console.log("focused and visible window client=", focusedAndVisible)

          //в мобильных браузерах свернутый браузер и даже с погашеным экраном выдает visibilityState == "visible"
          if (0 && focusedAndVisible && focusedAndVisible.url.indexOf(`Kopa:${e.data.data.place_id}`) != -1) {
            // targetClient.postMessage(event.notification.data, [])
          }
          else {
            self.registration.showNotification('Новое слово на копе', {
              body: e.data.data.value,
              renotify: true,
              tag: 'slovo:' + e.data.data.place_id,
              data: e.data,
              icon: "static/sw/slovoAdd.png",
              vabrate: [100, 100, 100, 100, 100]
            })
          }
        })
      break
  }
})

self.addEventListener('notificationclick', function (event) {
  console.log('On notification click: ', event.notification.tag)
  event.notification.close()
  event.waitUntil(clients.matchAll({type: "window"})
    .then(windowClients => {
      console.log("windows", windowClients)
      if (windowClients.length) {
        let targetClient = windowClients[windowClients.length - 1]
        for (let eachWindowClient of windowClients) {
          if (eachWindowClient.focused) {
            targetClient = eachWindowClient
            break
          }
        }

        // console.log("targetClient", targetClient)
        targetClient.postMessage(event.notification.data, [])
        return targetClient.focus()
      }
      //else clients.openWindow('https://kopnik.org/?state=main&body=Kopa:1')
    })
  )
})
