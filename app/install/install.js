const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

const installBlock = document.getElementById('install');
const msgBlock = document.getElementById('msg');

showMsg(msgBlock, '準備中....', 'text-info');

checkInstalled();

/* **************************
*          函式區
************************** */

function CreateAdminUser() {
  hideMsg(msgBlock, 0);
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) return;

  const auth = firebase.auth();
  auth.createUserWithEmailAndPassword(email, password)
    .then(user => {
      showMsg(msgBlock, '處理中....', 'text-info');
      const userDocRef = db.collection('users').doc(user.uid);
      return Promise.all([
        userDocRef.set({role: 'admin', name: name}),
        db.collection('flags').add({installed: true})
      ]);
    })
    .then(() => {
      const message = `新增完成<br />請登入 firestore 設定適當規則<br />建議將 install 資料夾刪除`;
      showMsg(msgBlock, message);
    })
    .catch(error => showMsg(msgBlock, error.message, 'text-error'));
}

function checkInstalled() {
  db.collection('flags')
    .where('installed', '==', true)
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        // 可進行安裝程序
        hideMsg(msgBlock, 0);
        installBlock.hidden = false;
      } else {
        // 不可進行安裝程序
        showMsg(msgBlock, '已安裝過囉', 'text-error');
      }
    })
    .catch(consoleLogError);
}