let version = 5
console.log(`service worker v.${version} parsing...`)

self.addEventListener('install', event => {
  console.log(`service worker v.${version} installing and skipping waiting...`)
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', event => {
  console.log(`service worker v.${version} activating and claiming...`)
  event.waitUntil(self.clients.claim())
})

self.addEventListener('message', (e) => {
  switch (e.data.eventType) {
    case "kopaAdd":
      self.registration.showNotification('Все на копу', {
        body: e.data.data.question,
        tag: 'kopa:' + e.data.data.id,
        data: e.data
      })
      break
    case "predlozhenieAdd":
      self.registration.showNotification('Новое предложение', {
        body: e.data.data.value,
        tag: 'predlozhenie:' + e.data.data.id,
        data: e.data
      })
      break
    case "slovoAdd":
      clients.matchAll({type: "window"})
        .then(windowClients => {
          console.log("window clients", windowClients, "message", e)

          let focused
          for (let eachWindowClient of windowClients) {
            if (eachWindowClient.focused) {
              focused = eachWindowClient
              break
            }
          }

          console.log("focused window client", focused)

          if (!focused || focused.url.indexOf(`Kopa:${e.data.data.place_id}`) == -1) {
            self.registration.showNotification('Новое слово', {
              body: e.data.data.value,
              tag: 'slovo:' + e.data.data.id,
              data: e.data
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

        targetClient.postMessage(event.notification.data, [])
        return targetClient.focus()
      }
      //else clients.openWindow('https://kopnik.org/?state=main&body=Kopa:1')
    })
  )
})
