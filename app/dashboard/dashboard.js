let currentUser = null;
let boards = [];
let currentBoard = null;

const myBoardsBlock = document.getElementById('my-boards');
const msgBlock = document.getElementById('msg');

const newBoardName = document.getElementById('new-board');

const resourcesBlock = document.getElementById('resources');
const resourcesTitle = document.getElementById('resources-title');

let userBoardsRef = null;

firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    redirectTo('../login');
    return;
  }

  currentUser = user;
  loadPage();
});


function loadPage() {

  initPage();

  userBoardsRef = db.collection(`users/${currentUser.uid}/boards`);

  userBoardsRef.onSnapshot(snapshot => {
    snapshot.docChanges.forEach(change => {
      // console.log(change, change.doc);
      const doc = change.doc;
      let idx;
      switch (change.type) {
        case 'added':
          boards = [...boards, doc];
          break;
        case 'modified':
          idx = boards.findIndex(elm => elm.id === doc.id);
          boards = [...boards.slice(0, idx), doc, ...boards.slice(idx+1)];
          break;
        case 'removed':
          boards = boards.filter(elm => elm.id !== doc.id);
          break;
      }
    });

    generateBoardList(boards);
  });

  function initPage() {
    myBoardsBlock.innerHTML = '載入中....';
    msgBlock.hidden = true;
    resourcesBlock.hidden = true;
  }

  function generateBoardList(boards) {
    if (boards.length === 0) {
      return myBoardsBlock.innerHTML = '---- 無 ----';
    }

    myBoardsBlock.innerHTML = '';
    boards.forEach(doc => {
      let board = doc.data();
      myBoardsBlock.innerHTML += `
        <div class="list-item" data-id="${doc.id}">
          <div class="list-item-label">${board.name}</div>
          <div class="tools" onclick="deleteBoard(event)">刪除</div>
        </div>`;
    });
  }
}

// 新增看板
function createBoard() {
  const boardName = newBoardName.value.trim();
  if (!boardName) return;

  const newDocRef =db.collection('boards').doc(); // no path, auto generated unique id returned
  const payload = {name: boardName, active: true};

  // 因為 firestore 的 write rule 的設定條件，因此新增之順序如下
  // 先在 user document 的 boards 子集合新增 看板 document
  userBoardsRef.doc(newDocRef.id)
      .set(payload)
      .then(() => newDocRef.set(payload)) // 再新增 boards 集合的 document
      .then(() => newBoardName.value = '')
      .catch(consoleLogError);
}

// 清單項目被點擊
function itemClicked(e) {
  // 因為在上層監聽，所以只處理具有特定樣式的子元素被點擊時
  if (e.target.classList.contains('list-item-label')) {
    const id = e.target.parentElement.dataset.id;
    const board = boards.filter(doc => doc.id === id)[0];
    currentBoard = board;

    console.log('edit, set current = ', board);

    // 顯示並初始化資源設定
    showAndInitResourcesBlock(currentBoard);
  }
}

// 刪除看板
function deleteBoard(e) {
  // console.log(`${e.target.parentElement.dataset.id} to delete`);
  // 欲刪除之看板 id
  const id = e.target.parentElement.dataset.id;
  // 停止事件擴散，避免觸發父層 click 事件
  e.stopPropagation();
  showMsg(msgBlock, '處理中....', 'text-info');

  // 因為 firestore 的 write rule 的設定條件，因此刪除之順序如下(與新增相反)
  // 先刪 boards 集合的 document
  db.collection('boards')
      .doc(id)
      .delete()
      .then(() => userBoardsRef.doc(id).delete()) // 再刪 user document 的 boards 子集合的看板 document
      .then(() => {
        resetCurrentBoard(id);
        console.log('after delete, current = ', currentBoard);
        hideMsg(msgBlock, 0);
      })
      .catch(consoleLogError);
  
  console.log('before delete, current = ', currentBoard);
}

// 刪除之看板若為 current board 則清除變數與畫面元素
function resetCurrentBoard(id) {
  if (currentBoard && currentBoard.id === id) {
    currentBoard = null;
    resourcesTitle.innerHTML = '';
    resourcesBlock.hidden = true;
  }
}

// 登出
function logout() {
  firebase.auth().signOut();
}