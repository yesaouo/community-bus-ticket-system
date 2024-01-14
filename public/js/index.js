// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCzgkKcqOb2jPrVSN7NUgSRBS9qXdtd31w",
  authDomain: "community-bus-ticket-system.firebaseapp.com",
  projectId: "community-bus-ticket-system",
  storageBucket: "community-bus-ticket-system.appspot.com",
  messagingSenderId: "574104090217",
  appId: "1:574104090217:web:b68c359664b1ea742a94f8",
  measurementId: "G-3NKHVKGM4H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


////////////////////////////////

const qrcode = new QRCode(document.getElementById("qrcode"), {
	width: 192,
	height: 192,
	colorDark : "#000000",
	colorLight : "#ffffff",
	correctLevel : QRCode.CorrectLevel.H
});
const html5QrCode = new Html5Qrcode("reader");
const qrCodeSuccessCallback = (decodedText, decodedResult) => {
    /* handle success */
    alert(decodedText);
    qrcode.makeCode(decodedText);
    stopScan();
};

function startScan() {
    scanDialog.showModal();
    html5QrCode.start(
        { facingMode: "environment" }, 
        { fps: 10, qrbox: { width: 256, height: 256 } },
        qrCodeSuccessCallback
    ).catch((err) => {
      // Start failed, handle it.
    });
}
function stopScan() {
    scanDialog.close();
    html5QrCode.stop().then((ignore) => {
        // QR Code scanning is stopped.
    }).catch((err) => {
        // Stop failed, handle it.
    });
}
startScanBtn.onclick = () => {
    startScan();
}
closeScanBtn.onclick = () => {
    stopScan();
}


//qrcode.clear(); // clear the code.
//qrcode.makeCode("CBTS01234567890123465789"); // make another code.