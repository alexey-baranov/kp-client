if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);

      navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
        serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true})
          .then(function (subscription) {

            debugger
            //return sendSubscriptionToServer(subscription);
          })
          .catch(function (e) {
            if (Notification.permission === 'denied') {
              // The user denied the notification permission which
              // means we failed to subscribe and the user will need
              // to manually change the notification permission to
              // subscribe to push messages
              window.Demo.debug.log('Permission for Notifications was denied');
              pushButton.disabled = true;
            } else {
              // A problem occurred with the subscription, this can
              // often be down to an issue or lack of the gcm_sender_id
              // and / or gcm_user_visible_only
              window.Demo.debug.log('Unable to subscribe to push.', e);
              pushButton.disabled = false;
              pushButton.textContent = 'Enable Push Messages';
            }
          });
      })




    }).catch(function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
