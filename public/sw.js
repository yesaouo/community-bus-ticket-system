const cacheName = "store-v0.1";
const assets = [
    '/',
    '/index.html',
    '/offline.html',
    '/css/',
    '/css/info.css',
    '/css/scan.css',
    '/css/styles.css',
    '/img/',
    '/img/caution.png',
    '/img/profile-user.png',
    '/img/qr-code-scan.png',
    '/img/question-mark.png',
    '/img/refresh.png',
    '/img/remove.png',
    '/img/wifi-slash.png',
    '/js/',
    '/js/html5-qrcode.min.js',
    '/js/qrcode.min.js',
    '/js/scripts.js',
    '/js/index.js',
    '/js/offline.js'
];

self.addEventListener('install', (e) => {
    console.log("installing...");
    e.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(assets)));
});
self.addEventListener("activate", (e) => {
    console.log("ready to handle fetches!");
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== cacheName) {return caches.delete(key);}
                })
            );
        })
    );
});  
self.addEventListener('fetch', (e) => {
    console.log("fetch", e.request.url);
    e.respondWith(caches.match(e.request).then((response) => response || fetch(e.request)));
});