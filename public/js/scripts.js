function toggleContent(id) {
    const button = document.getElementById('button' + id);
    const content = document.getElementById('content' + id);
    if (content.style.maxHeight) {
        content.style.maxHeight = null;
        setTimeout(function() {
            button.classList.remove('open');
        }, 200);
    } else {
        button.classList.add('open');
        setTimeout(function() {
            content.style.maxHeight = content.scrollHeight + "px";
        }, 200);
    } 
}

window.onload = () => {
    if('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => { console.log('Service Worker Registered'); });
    }
};
window.ononline = () => {
    window.location.href = 'index.html';
};
window.onoffline = () => {
    window.location.href = 'offline.html';
};