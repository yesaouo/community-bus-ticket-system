const id = localStorage.getItem('CBTS-ID') || null;
const point = localStorage.getItem('CBTS-Point') || 0;
const qrcode = new QRCode(document.getElementById("qrcode"), {
	width: 192,
	height: 192,
	colorDark : "#000000",
	colorLight : "#ffffff",
	correctLevel : QRCode.CorrectLevel.H
});

userBtn.onclick = () => {
    alert('無網際網路存取');
}
startScanBtn.onclick = () => {
    alert('無網際網路存取');
}
refreshBtn.onclick = () => {
    alert('無網際網路存取');
}
infoBtn.onclick = () => {
    infoDialog.showModal();
}
closeInfoBtn.onclick = () => {
    infoDialog.close();
}

window.onload = () => {
    if (id) {
        qrcode.makeCode(`CBTS${id}`);
        pointSpan.innerHTML = point;
        synopsisDiv.style.display = 'none';
        ticketDiv.style.display = 'block';
    }
};