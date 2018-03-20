const emailInput = document.querySelector('input[type=email]');
const passwordInput = document.querySelector('input[type=password]');
const msgBlock = document.getElementById('msg');

function login() {
  let email = emailInput.value.trim();
  let password = passwordInput.value.trim();
  if (!email || !password) return;

  showMsg(msgBlock, '處理中....', 'text-info');
  firebase.auth()
    .signInWithEmailAndPassword(email, password)
    .then(user => checkUserDoc(user.uid))
    .then((msg) => {
      console.log(msg);
      hideMsg(msgBlock, 0);
      redirectTo('../dashboard');
    })
    .catch(error => {
      consoleLogError(error);
      showMsg(msgBlock, '登入失敗', 'text-error');
      hideMsg(msgBlock);
    });
}

function checkUserDoc(uid) {
  // console.log('checking...' + uid);
  const userDocRef = db.collection('users').doc(uid);
  return new Promise((resolve, reject) => userDocRef.get()
    .then(doc => {
      if (!doc.exists) {
        // console.log( uid + ' not exists');
        return userDocRef.set({role: 'normal'}).then(() => resolve('user doc added'));
      }
      // console.log( uid + ' exists');
      resolve('user doc exists');
    })
    .catch(error => {
      consoleLogError(error);
      reject(error);
    })
  );
}