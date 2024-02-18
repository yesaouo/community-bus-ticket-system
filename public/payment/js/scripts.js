window.onload = () => {
    if('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => { console.log('Service Worker Registered'); });
    }
    if (!navigator.onLine) {
        offline();
    }
};
window.ononline = () => {
    online();
};
window.onoffline = () => {
    offline();
};

function online() {
    halfTicket.innerHTML = '半票';
    halfTicket.disabled = false;
    fullTicket.innerHTML = '全票';
    fullTicket.disabled = false;
    alert('已重新連線');
}
function offline() {
    halfTicket.innerHTML = '<img src="img/wifi-slash.png">';
    halfTicket.disabled = true;
    fullTicket.innerHTML = '<img src="img/wifi-slash.png">';
    fullTicket.disabled = true;
    alert('網路發生異常，等待重新連線');
}