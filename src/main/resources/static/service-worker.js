// 푸시 알림 관련
self.addEventListener('push', function (event) { // 푸시 알림이 도착할 때 발생하는 push 이벤트를 리스닝하고, 해당 알림을 처리합니다.
    const data = event.data.json();

    const options = {
        body: data.body,
        icon: 'icon.png'
    };

    event.waitUntil( // 푸시 알림을 정상적으로 브라우저에 표시할 때까지 작업이 중단되지 않도록 보장하는 역할을 합니다.
        self.registration.showNotification(data.title, options) // Service Worker의 registration 객체에서 showNotification() 메서드를 호출하여 푸시 알림을 실제로 표시합니다.
    );
});

// 푸시 알림을 클릭했을 때 발생하는 notificationclick 이벤트를 리스닝하고, 해당 알림을 처리합니다.
self.addEventListener('notificationclick', function (event) {
    const notification = event.notification;
    const action = event.action;

    console.log('serviceWorker.notificationclick: notification', notification);
    console.log('serviceWorker.notificationclick: event', event);

    event.waitUntil(
        self.clients.matchAll({type: 'window'}).then(windowClients => {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === notification.data.url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(notification.data.url);
            }
        })
    );


    switch (action) {
        case "my-confirm":
            console.log('confirmed');
            notification.close()
            break;
        case "my-cancel":
            console.log('cancelled');
            break;
    }
});

// 푸시 알림이 닫힐 때 발생하는 notificationclose 이벤트를 리스닝하고, 해당 알림을 처리합니다.
self.addEventListener("notificationclose", function (event) {
    console.log("Notification was closed", event);
});
