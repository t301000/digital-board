firebase.initializeApp(config);
const db = firebase.firestore();

/*========== 函數區 ==========*/
// 重導向
function redirectTo(target = '') {
  if (!target) return;
  location.replace(target);
  // location.href(target);
}

// 取得目前登入 user，未登入則為 null
// 參考資料：
// https://stackoverflow.com/questions/47043188/firebase-onauthstatechanged-unsubscribe-recursion
// function getCurrentUser(cb) {
//   const unsubscribe = firebase.auth().onAuthStateChanged(function(user) {
//     unsubscribe();
//     cb(user);
//   });
// }
function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = firebase.auth().onAuthStateChanged(function(user) {
      unsubscribe();
      console.log(user)
      resolve(user);
    })
  });
}
// 取得目前登入 user，未登入則為 null
// promise 版
// 參考資料：
// https://stackoverflow.com/questions/47043188/firebase-onauthstatechanged-unsubscribe-recursion
/*
function getCurrentUser(cb) {
  return new Promise((resolve, reject) => {
    const unsubscribe = firebase.auth().onAuthStateChanged(function(user) {
      unsubscribe();
      cb(user);
      resolve(user);
    }, error => reject(error));
  });
}
*/

// 守衛，只准 guest，已登入則轉向
function guestGuard(user, url = '../dashboard') {
  if (user) redirectTo(url);
}

// 守衛，未登入則轉向 login
function authGuard(user) {
  console.log(user);
  if(!user) redirectTo('../login');
}

// 顯示訊息
// 操作元素、訊息內容、css class
function showMsg(elm = null, msg = null, className = 'text-success') {
  if (!elm || !msg) return;
  elm.innerHTML = msg;
  elm.classList = className;
  elm.hidden = false;
}

// 隱藏訊息
// 操作之元素、毫秒(0 則立即隱藏)
function hideMsg(elm = null, ms = 3000) {
  if (!elm) return;
  if (ms > 0) {
    setTimeout(
      () => {
        elm.innerHTML = '';
        elm.hidden = true;
      },
      ms
    );
  } else {
    elm.innerHTML = '';
    elm.hidden = true;
  }
}

// console log error
function consoleLogError(error) {
  console.log(error);
}