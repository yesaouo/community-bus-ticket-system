const cacheName = "store-v0.2";
const assets = [
    '/',
    '/index.html',
    '/css/',
    '/css/alert.css',
    '/css/scan.css',
    '/css/sign.css',
    '/css/styles.css',
    '/img/',
    '/img/cbts.png',
    '/img/remove.png',
    '/img/wifi-slash.png',
    '/js/',
    '/js/html5-qrcode.min.js',
    '/js/index.js',
    '/js/scripts.js'
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