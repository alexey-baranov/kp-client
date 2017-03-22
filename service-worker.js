/**
 * Created by alexey2baranov on 16.02.17.
 */

'use strict';



this.addEventListener('install', function (event) {
  console.info("installed")
})

self.addEventListener("message", function (e) {
  try {
    // e.source is a client object
    console.log("message", e.data)

    alert("nitificating...")

    self.registration.showNotification(e.data, {
      body: "body",
      icon: "https://cdn1.iconfinder.com/data/icons/user-experience/512/speak-512.png",
      tag: 'tag'
    })

    console.log("posting your message back...")
    e.source.postMessage("Hello! Your message was: " + e.data);
  }
  catch(err){
    alert(err)
  }
});


self.addEventListener('notificationclick', function (event) {
  console.log('On notification click: ', event.notification);
  // Android doesn’t close the notification when you click on it
  // See: http://crbug.com/463146
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(clients.matchAll({
    type: 'window'
  }).then(function (clientList) {
    for (var i = 0; i < clientList.length; i++) {
      var client = clientList[i];
      return client.focus();
    }
    if (clients.openWindow) {
      return clients.openWindow('/');
    }
  }));
});
