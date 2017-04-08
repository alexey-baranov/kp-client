let version = 12
console.log(`service worker v.${version} parsindsfsag....`)

self.addEventListener('install', event => {
  console.log(`service worker v.${version} installing and skipping waiting...`)
  event.waitUntil(self.skipWaiting())
})
self.addEventListener('activate', event => {
  console.log(`service worker v.${version} activating and claiming...`)
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', function (event) {
  console.log('Received a push message', event.data.json())
  let data = event.data.json(),
    wait

  switch (data.eventType) {
    case "kopaAdd":
      wait = self.registration.showNotification('Все на копу!!', {
        body: data.model.question,
        tag: 'kopa:' + data.model.id,
        data: data,
        icon: "static/sw/kopaAdd.jpg",
        vabrate: [5000, 1000, 5000]
      })
      break
    case "predlozhenieAdd":
      wait = self.registration.showNotification('Новое предложение', {
        body: data.model.value,
        tag: 'predlozhenie:' + data.model.id,
        data: data,
        icon: "static/sw/predlozhenieAdd.png",
        vabrate: [2500, 500, 2500]
      })
      break
    case "predlozhenieState":
      wait = self.registration.showNotification(data.model.state>0?'Предложение проголосовали ЗА':"Предложение отклонили", {
        body: data.model.value,
        renotify: true,
        tag: 'predlozhenie:' + data.model.id,
        data: data,
        icon: "static/sw/predlozhenieAdd.png",
        vabrate: [2500, 500, 2500]
      })
      break
    case "slovoAdd":
      wait = clients.matchAll({type: "window"})
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
          if (0 && focusedAndVisible && focusedAndVisible.url.indexOf(`Kopa:${data.model.place_id}`) != -1) {
            // targetClient.postMessage(event.notification.data, [])
          }
          else {
            self.registration.showNotification('Новое слово на копе', {
              body: data.model.value,
              renotify: true,
              tag: 'slovo:' + data.model.place_id,
              data: data,
              icon: "static/sw/slovoAdd.png",
              vabrate: [100, 100, 100, 100, 100]
            })
          }
        })
      break
  }
  event.waitUntil(wait)
})

self.addEventListener('notificationclick', function (event) {
  console.log('On notification click: ', event.notification.data)
  event.notification.close()
  let data = event.notification.data
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
        targetClient.postMessage(data, [])
        return targetClient.focus()
      }
      else {
        let query
        switch (data.eventType) {
          case "kopaAdd":
            query = "body=Kopa:" + data.model.id
            break
          case "predlozhenieAdd":
          case "predlozhenieState":
            query = `body=Kopa:${data.model.place_id}&v[body][scroll]=Predlozhenie:${data.model.id}`
            break
          case "slovoAdd":
            query = `body=Kopa:${data.model.place_id}&v[body][scroll]=Slovo:${data.model.id}`
            break
        }
        return clients.openWindow('/?' + query)
      }
    })
  )
})
