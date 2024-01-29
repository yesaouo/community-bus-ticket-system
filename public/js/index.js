// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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

async function getTicketPoint(id) {
    if (typeof id === 'string' && id.length === 20) {
        const docSnap = await getDoc(doc(db, "tickets", id));
        if (docSnap.exists() && docSnap.data().point !== null)
            return parseInt(docSnap.data().point);
    }
    return null;
}
async function getUserTickets() {
    let tickets = [], point = 0;
    if (auth.currentUser) {
        const docSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (docSnap.exists() && docSnap.data().tickets) {
            tickets = docSnap.data().tickets;
            for (const ticket of tickets)
                point += await getTicketPoint(ticket);
        } else { await setDoc(doc(db, "users", uid), { tickets: [] }); }
    }
    return [ tickets, point ];
}
async function mergeTicket(id) {
    if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        await updateDoc(doc(db, "users", uid), { tickets: arrayUnion(id) });
        const docSnap = await getDoc(doc(db, "users", uid));
        if (docSnap.exists() && docSnap.data().tickets) {
            let point = 0;
            for (const ticket of docSnap.data().tickets)
                point += await getTicketPoint(ticket);
            setTicketDiv(uid, point);
        }
    }
}
onAuthStateChanged(auth, async(user) => {
    if (user) {
        userBtn.innerHTML = `<img src="${user.photoURL}">`;
        const uid = user.uid;
        const [ tickets, authPoint ] = await getUserTickets();
        const id = localStorage.getItem('CBTS-ID') || null;
        const point = await getTicketPoint(id);
        if (point !== null) {
            if (!tickets.includes(id)) {
                mergeTextDiv.innerHTML = `本地餘額: ${point}<br>帳戶餘額: ${authPoint}`;
                unmergeBtn.innerHTML = '取消登入';
                mergeBtn.innerHTML = '上傳雲端';
                unmergeBtn.onclick = () => { auth.signOut(); }
                mergeBtn.onclick = () => { mergeTicket(id); }
                openMergeDiv();
            } else { setTicketDiv(uid, authPoint); }
        } else { setTicketDiv(uid, authPoint); }

        userBtn.onclick = () => {
            if (confirm('確定要登出嗎'))
                auth.signOut();
        }
    } else {
        userBtn.innerHTML = '<img src="img/profile-user.png">';
        const id = localStorage.getItem('CBTS-ID') || null;
        const point = await getTicketPoint(id);
        if (point !== null) {
            setTicketDiv(id, point);
        } else { openSynopsisDiv(); }

        userBtn.onclick = () => {
            if (confirm('即將轉至Google進行第三方登入。\n若未自動跳轉，請確保已啟用「彈出式視窗與重新導向」權限。')) {
                const provider = new GoogleAuthProvider();
                signInWithPopup(auth, provider);
            }
        }
    }
});

const qrCodeSuccessCallback = async(decodedText, decodedResult) => {
    stopScan();
    const id = decodedText;
    const localId = localStorage.getItem('CBTS-ID') || null;
    if (typeof id === 'string' && id.length === 20) {
        const point = await getTicketPoint(id);
        if (point !== null) {
            if (auth.currentUser) {
                const uid = auth.currentUser.uid;
                const [ tickets, authPoint ] = await getUserTickets();
                if (!tickets.includes(id)) {
                    mergeTextDiv.innerHTML = `掃描餘額: ${point}<br>帳戶餘額: ${authPoint}`;
                    unmergeBtn.innerHTML = '退出掃描';
                    mergeBtn.innerHTML = '上傳雲端';
                    unmergeBtn.onclick = () => { setTicketDiv(uid, authPoint); }
                    mergeBtn.onclick = () => { mergeTicket(id); }
                    openMergeDiv();
                } else { alert('此車票已綁定在帳戶中') }
            } else if (typeof localId === 'string' && localId.length === 20) {
                if (localId !== id) {
                    const localPoint = await getTicketPoint(localId);
                    if (localPoint !== null) {
                        mergeTextDiv.innerHTML = `本地餘額: ${localPoint}<br>掃描餘額: ${point}`;
                        unmergeBtn.innerHTML = '退出掃描';
                        mergeBtn.innerHTML = '變更車票';
                        unmergeBtn.onclick = () => { setTicketDiv(localId, localPoint); }
                        mergeBtn.onclick = () => {
                            if (confirm('點擊變更車票按鈕後，請留意：若您的車票未保存，可能導致遺失，或需前往服務中心進行車票合併。'))
                                setTicketDiv(id, point);
                        }
                        openMergeDiv();
                    } else { setTicketDiv(id, point); }
                } else { setTicketDiv(id, point); }
            } else { setTicketDiv(id, point); }
        } else { alert('查無此車票'); }
    } else { alert('查無此車票'); }
};

const qrcode = new QRCode(document.getElementById("qrcode"), {
	width: 192,
	height: 192,
	colorDark : "#000000",
	colorLight : "#ffffff",
	correctLevel : QRCode.CorrectLevel.H
});
const html5QrCode = new Html5Qrcode("reader");

function setTicketDiv(id, point) {
    localStorage.setItem('CBTS-ID', id);
    localStorage.setItem('CBTS-Point', point);
    qrcode.makeCode(`CBTS${id}`);
    pointSpan.innerHTML = point;
    synopsisDiv.style.display = 'none';
    mergeDiv.style.display = 'none';
    ticketDiv.style.display = 'block';
}
function openSynopsisDiv() {
    ticketDiv.style.display = 'none';
    mergeDiv.style.display = 'none';
    synopsisDiv.style.display = 'block';
}
function openMergeDiv() {
    synopsisDiv.style.display = 'none';
    ticketDiv.style.display = 'none';
    mergeDiv.style.display = 'block';
}
function startScan() {
    scanDialog.showModal();
    html5QrCode.start(
        { facingMode: "environment" }, 
        { fps: 10 },
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
infoBtn.onclick = () => {
    infoDialog.showModal();
}
closeInfoBtn.onclick = () => {
    infoDialog.close();
}
refreshBtn.onclick = async() => {
    const id = localStorage.getItem('CBTS-ID') || null;
    let point = 0, tickets = [];
    if (typeof id === 'string') {
        if (id.length === 20)
            point = await getTicketPoint(localStorage.getItem('CBTS-ID'));
        if (id.length === 28)
            [ tickets, point ] = await getUserTickets();
    }
    pointSpan.innerHTML = point || 0;
}