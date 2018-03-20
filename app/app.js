// 取得功能區塊
const selectBlock = document.getElementById('select');
const mainBlock = document.getElementById('main');
// 看板選單
const selectElm = document.querySelector('select');
// 取得 iframe
const slideIframe = document.getElementById('slide');
const photoIframe = document.getElementById('photo');
const playlistIframe = document.getElementById('playlist');

// 載入內容
loadContentOrSelect();

/*========== 函數 ==========*/
// 載入電子看板或電子看板選單
function loadContentOrSelect() {
  let board = localStorage.getItem('board');

  if (board) {
    // 已設定處室
    selectBlock.hidden = true;
    mainBlock.style.display = 'grid'; // mainBlock.hidden = false 似乎無法正常作用
    // 載入電子看板
    loadDigitalBoard(board);
  } else {
    // 未設定看板，則顯示選單
    getBoardsList();
    selectBlock.hidden = false;
    mainBlock.style.display = 'none'; // mainBlock.hidden = true 似乎無法正常作用
  }
}

// 載入看板列表，產生選單
function getBoardsList() {
  const btn = document.querySelector('button');
  const boardsRef = db.collection('boards');
  boardsRef.where('active', '==', true)
    .get()
    .then(snapshot => {
      let docs = snapshot.docs;
      docs.forEach(doc =>{
        let data = doc.data();
        selectElm.innerHTML += `<option value="${doc.id}">${data.name}</option>`;
      });
      if (docs.length > 0) btn.disabled = false;
    })
    .catch(consoleLogError);
}

// 載入電子看板
function loadDigitalBoard(board) {
  // 取得 resources collection 參考
  const boardUrlsRef = db.collection('boards').doc(board).collection('urls');
  // 取得所有 doc，並監聽是否有變化
  // 依變化的 event type 進行處理
  // 參考文件：
  // https://firebase.google.com/docs/firestore/query-data/listen?authuser=0#listen_to_multiple_documents_in_a_collection
  boardUrlsRef.onSnapshot(
    querySnapshot => querySnapshot.docChanges.forEach(
      change => {
        const resourceType = change.doc.id;
        const url = (change.doc.data()).url;
        switch (change.type) {
          case 'added': // for 新增或第一次載入
          case 'modified': // for 修改
            setIframe(resourceType, url);
            break;
        }
      }
    )
  );
}

// 設定各 iframe 的 src attribute
function setIframe(resourceType, url) {
  switch (resourceType) {
    case 'slide':
      slideIframe.setAttribute('src', url);
      break;
    case 'photo':
      photoIframe.setAttribute('src', url);
      break;
    case 'playlist':
      let preUrl = 'https://www.youtube.com/embed/videoseries?autoplay=1&loop=1&controls=0&showinfo=1&mute=0&cc_load_policy=1&list=';
      playlistIframe.setAttribute('src', preUrl + url);
      break;
  }
}

// 設定欲載入之看板，然後載入
function setBoard() {
  localStorage.setItem('board', selectElm.value);
  loadContentOrSelect();
}
