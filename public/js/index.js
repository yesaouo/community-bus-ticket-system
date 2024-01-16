// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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
const auth = getAuth();
const db = getFirestore(app);

async function setTicket(id) {
    const localId = localStorage.getItem('CBTS-Ticket');
    if (localId && localId === id) {
        const localPoint = await getTicket(localId);
        if (localPoint) {
            setTicketDiv(localId, localPoint);
        }
    } else {
        const localPoint = await getTicket(localId);
        const cloudPoint = await getTicket(id);
        if (localPoint && cloudPoint) {
            mergeTextDiv.innerHTML = `本地餘額: ${localPoint}<br>帳戶餘額: ${cloudPoint}`;
            unmergeBtn.innerHTML = '取消登入';
            synopsisDiv.style.display = 'none';
            ticketDiv.style.display = 'none';
            mergeDiv.style.display = 'block';

            unmergeBtn.onclick = () => {
                auth.signOut();
                alert('已登出');
            }
            mergeBtn.onclick = () => {
                if (confirm('')) {
                    //下載原本車票並變更 合併給管理員
                }
            }
        } else if (localPoint) {
            setTicketDiv(localId, localPoint);
        } else if (cloudPoint) {
            setTicketDiv(id, cloudPoint);
        }
    }

    async function getTicket(id) {
        if (id && typeof id === 'string' && id.length === 20) {
            const docSnap = await getDoc(doc(db, "tickets", id));
            if (docSnap.exists() && docSnap.data().point)
                return docSnap.data().point;
        }
        return null;
    }
    function setTicketDiv(id, point) {
        qrcode.makeCode(`CBTS${id}`);
        pointSpan.innerHTML = point;
        refreshBtn.innerHTML = '<img src="img/refresh.png">';
        synopsisDiv.style.display = 'none';
        mergeDiv.style.display = 'none';
        ticketDiv.style.display = 'block';
    }
}
onAuthStateChanged(auth, async(user) => {
    if (user) {
        userBtn.innerHTML = `<img src="${user.photoURL}">`;
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists() && docSnap.data().ticket)
            setTicket(docSnap.data().ticket);

        userBtn.onclick = () => {
            if (confirm('確定要登出嗎'))
                auth.signOut();
        }
    } else {
        userBtn.innerHTML = '<img src="img/profile-user.png">';
        if (localStorage.getItem('CBTS-Ticket'))
            setTicket(localStorage.getItem('CBTS-Ticket'));

        userBtn.onclick = () => {
            if (confirm('將跳轉至Google進行第三方登入\n如果未能自動跳轉，請確保您開啟了"彈出式視窗與重新導向"的權限。')) {
                const provider = new GoogleAuthProvider();
                signInWithPopup(auth, provider);
            }
        }
    }
});

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