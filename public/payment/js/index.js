// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword , signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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

async function getTicketPoint(id, cost = 0) {
    try {
        if (id.length === 20) {
            const ticketSnap = await getDoc(doc(db, "tickets", id));
            return parseInt(ticketSnap.data().point);
        } else if (id.length === 28) {
            const userRef = doc(db, "users", id);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists() && Array.isArray(userSnap.data().tickets) && userSnap.data().tickets.length > 0) {
                const tickets = userSnap.data().tickets;
                const ticket = tickets[0];
                let point = 0;
                let ticketRef, ticketSnap;
                for (let i = 1; i < tickets.length; i++) {
                    ticketRef = doc(db, "tickets", tickets[i]);
                    ticketSnap = await getDoc(ticketRef);
                    if (ticketSnap.exists() && ticketSnap.data().point !== null && parseInt(ticketSnap.data().point))
                        point += parseInt(ticketSnap.data().point);
                    await deleteDoc(ticketRef);
                }
                ticketRef = doc(db, "tickets", ticket);
                point -= cost;
                if (point)
                    await updateDoc(ticketRef, { point: increment(point) });
                await updateDoc(userRef, { tickets: [ticket] });
                ticketSnap = await getDoc(ticketRef);
                return parseInt(ticketSnap.data().point);
            }
        }
        return null;
    } catch { return null; }
}
function showPoint(point, cost, id) {
    if (point >= 0) {
        alertMsgP.innerHTML = '剩餘餘額: ' + point;
        alertBtn.innerHTML = '關閉';
        alertBtn.onclick = () => {
            alertDialog.close();
        }
    } else {
        alertMsgP.innerHTML = '餘額不足，餘額補足後將自動扣款';
        alertBtn.innerHTML = '取消';
        alertBtn.onclick = async() => {
            alertBtn.innerHTML = '正在取消';
            alertBtn.disabled = true;
            await updateDoc(doc(db, "tickets", id), {
                point: increment(cost)
            });
            alertDialog.close();
        }
    }

    alertTimeP.innerHTML = '5秒後自動關閉';
    alertBtn.disabled = false;
    alertDialog.showModal();
    setTimeout(function() {
        alertTimeP.innerHTML = '4秒後自動關閉';
        setTimeout(function() {
            alertTimeP.innerHTML = '3秒後自動關閉';
            setTimeout(function() {
                alertTimeP.innerHTML = '2秒後自動關閉';
                setTimeout(function() {
                    alertTimeP.innerHTML = '1秒後自動關閉';
                    setTimeout(function() {
                        alertDialog.close();
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 1000);
    }, 1000);
}
function showError() {
    alertMsgP.innerHTML = '車票格式有誤或是系統發生錯誤';
    alertTimeP.innerHTML = '如有任何問題請洽服務中心詢問';
    alertBtn.innerHTML = '關閉';
    alertBtn.disabled = false;
    alertBtn.onclick = () => {
        alertDialog.close();
    }
    alertDialog.showModal();
}


const html5QrCode = new Html5Qrcode("reader");
function startScan(cost) {
    const qrCodeSuccessCallback = async(id, decodedResult) => {
        stopScan();
        if (id.startsWith("CBTS:")) {
            const ticket = id.substring(5);
            const point = await getTicketPoint(ticket, cost);
            if (point !== null) {
                showPoint(point, cost, ticket);
            } else { showError(); }
        } else { showError(); }
    };

    scanDialog.showModal();
    html5QrCode.start(
        { facingMode: "user" }, 
        { fps: 10 },
        qrCodeSuccessCallback
    ).catch((err) => {
        scanDialog.close();
        alert(err);
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
closeScanBtn.onclick = () => {
    stopScan();
}


onAuthStateChanged(auth, async(user) => {
    if (user) {
        if (!user.email.endsWith('@cbts.com'))
            auth.signOut();
        halfTicket.onclick = () => { startScan(1); }
        fullTicket.onclick = () => { startScan(2); }
        signDialog.close();
    } else {
        halfTicket.onclick = () => { alert('請先登入帳號');signDialog.showModal(); }
        fullTicket.onclick = () => { alert('請先登入帳號');signDialog.showModal(); }
        signDialog.showModal();
        loginBtn.onclick = async() => {
            const name = nameInput.value;
            const pin = pinInput.value;
            if (name && pin) {
                const driverSnap = await getDoc(doc(db, "drivers", name));
                if (driverSnap.exists() && driverSnap.data().account !== null) {
                    signInWithEmailAndPassword(auth, driverSnap.data().account, 'CBTS' + pin)
                    .then((userCredential) => {
                        alert(`嗨，${name}！祝您行車順利，一路平安！`);
                    })
                    .catch((error) => {
                        alert('PIN碼錯誤');
                    });
                } else { alert('查無此司機'); }
            } else { alert('請輸入您的名字和PIN碼'); }
        }
    }
});