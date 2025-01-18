const publicVapidKey = "BP_ZbCSIxUKUqS82WCYpNAO04VpF0_xMGPmuSv3a16SEwrZSnxW1m34DpEW0fmVJM4fJY-9VqSzUd2PTloV2rW8";
const notificationBtn = document.getElementById('notificationBtn');
const consoleDiv = document.getElementById('console');

const titleInput = document.getElementById('title');
const bodyInput = document.getElementById('body');
const sendNotificationBtn = document.getElementById('sendNotificationBtn');

sendNotificationBtn.addEventListener('click', async () => {
    const response = await fetch("/push", {
        method: 'POST',
        body: JSON.stringify({
            title: titleInput.value,
            body: bodyInput.value
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.status === 204) {
        consoleDiv.innerText = '알림 전송 성공';
    } else {
        consoleDiv.innerText = '알림 전송 실패';
    }
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("service-worker.js")
        .then(function (registration) {
            console.log('Service Worker 등록 성공:', registration);
        })
        .catch(function (error) {
            console.error('Service Worker 등록 실패:', error);
        });
} else {
    consoleDiv.innerText = 'Service Worker를 지원하지 않는 브라우저입니다. 푸시 알림을 사용할 수 없습니다.';
}

if ("Notification" in window) {
    notificationBtn.addEventListener('click', askForNotificationPermission);
} else {
    consoleDiv.innerText = 'Notification을 지원하지 않는 브라우저입니다. 알림을 사용할 수 없습니다.';
}

function askForNotificationPermission() {
    Notification.requestPermission().then(permission => {
        if (permission !== 'granted') {
            consoleDiv.innerText = '알림 권한이 거부되었습니다.';
            console.error('알림 권한이 거부되었습니다.');
            return;
        }
        consoleDiv.innerText = '알림 권한이 허용되었습니다.';
        // 알림 권한이 허용되었을 때 구독 요청
        configurePushSubscription();
    });
}

async function configurePushSubscription() {
    if (!('serviceWorker' in navigator)) {
        console.error()
        return;
    }
    let serviceWorkerRegistration = await navigator.serviceWorker.ready;
    let subscription = await serviceWorkerRegistration.pushManager.getSubscription();
    if (subscription === null) {
        // create a new subscription
        console.log('create a new subscription');
        subscription = await serviceWorkerRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        })
    }
    console.log('subscription:', subscription);

    let response = await fetch('/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription), // 구독된 정보를 서버에 전송
        headers: {
            'Content-Type': 'application/json'
        }
    });
    consoleDiv.innerText = '서버 구독이 완료되었습니다.'
    console.log('서버 응답:', response.status);

}


function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}