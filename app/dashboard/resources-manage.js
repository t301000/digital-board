const slide = document.getElementById('slide-url');
const photo = document.getElementById('photo-url');
const playlist = document.getElementById('youtube-playlist');
const urlFields = {slide, photo, playlist};

const slideStart = document.querySelector('#slide-options .start');
const slideLoop = document.querySelector('#slide-options .loop');
const slideRm = document.querySelector('#slide-options .rm');
const slideDelayms = document.querySelector('#slide-options .delayms');
const slideOptions = {
  start: slideStart,
  loop: slideLoop,
  rm: slideRm,
  delayms: slideDelayms};

const photoStart = document.querySelector('#photo-options .start');
const photoLoop = document.querySelector('#photo-options .loop');
const photoRm = document.querySelector('#photo-options .rm');
const photoDelayms = document.querySelector('#photo-options .delayms');
const photoOptions = {
  start: photoStart,
  loop: photoLoop,
  rm: photoRm,
  delayms: photoDelayms};

function showAndInitResourcesBlock(board) {

  resourcesTitle.innerHTML = `${(board.data()).name} 資源設定`;
  resourcesBlock.hidden = false;

  showMsg(msgBlock, '處理中....', 'text-info');
  initResources(board);
}

function initResources(board) {

  // urls sub collection ref
  const urlsRef = db.collection(`boards/${board.id}/urls`);

  urlsRef.get()
    .then(snapshot => initUrls(snapshot))
    .catch(consoleLogError);
}

function initUrls(snapshot) {
  // 先清空
  clearAllFieldAndOptions();
  
  // 如果是空的 collection 則停止
  if (snapshot.empty) {
    hideMsg(msgBlock, 500);
    return;
  }
  
  // 取得 urls collection 中的 docs
  const urlDocs = snapshot.docs;

  urlDocs.forEach(doc => {
    urlFields[doc.id].value = doc.data().url;
    if (doc.id === 'slide' || doc.id === 'photo') {
      const queryString = doc.data().url.split('?')[1];
      initOptions(doc.id, queryString);
    }
  });

  hideMsg(msgBlock, 500);

  // 所有表單欄位值清空
  function clearAllFieldAndOptions() {
    for (let key in urlFields) {
      urlFields[key].value = '';
    }

    for (let key in slideOptions) {
      if (key === 'delayms') {
        slideOptions[key].value = 0;
      } else {
        slideOptions[key].checked = false;
      }
    }

    for (let key in photoOptions) {
      if (key === 'delayms') {
        photoOptions[key].value = 0;
      } else {
        photoOptions[key].checked = false;
      }
    }
  }

  // 依原參數初始化選項欄位值
  function initOptions(type, queryString) {
    // queryString 為 undefined 時略過
    if (!queryString) return;
    
    // 由字串轉換為物件，布林值與數字會變成字串
    const options = getOptionsObj(queryString);

    switch (type) {
      case 'slide':
        setOptions(slideOptions, options);
        break;
      case 'photo':
        setOptions(photoOptions, options);
        break;
    }
  }

}

// 由字串轉換為物件，布林值與數字會變成字串
function getOptionsObj(str) {
  if (!str) return {};

  let result;
  result = str.split('&')
    .reduce((acc, curr) => {
      let temp = curr.split('=');
      acc[temp[0]] = temp[1];
      return acc;
    }, {});

  return result;
}

// 設定選項欄位值
function setOptions(optionElms, optionValues) {
  for (let key in optionElms) {
    switch (key) {
      case 'start':
      case 'loop':
        optionElms[key].checked = optionValues[key] === 'true';
        break;
      case 'rm':
        optionElms[key].checked = optionValues[key] === 'minimal';
        break;
      case 'delayms':
        optionElms.delayms.value = optionValues.delayms ? +optionValues.delayms / 1000 : 0;
        break;
    }
  }
}

// 設定是否自動播放
function setStart(type) {
  setStartOrLoopOrRm(type, 'start');
}

// 設定是否循環播放
function setLoop(type) {
  setStartOrLoopOrRm(type, 'loop');
}

// 設定是否顯示控制列
function setRm(type) {
  setStartOrLoopOrRm(type, 'rm');
}

// 設定單頁停留時間
function setDelayms(type) {
  const field = urlFields[type];
  const optionElm = type === 'slide' ? slideOptions.delayms : photoOptions.delayms;

  const [url, options] = field.value.split('?');
  const newOptions = getOptionsObj(options);

  let sec = +optionElm.value.trim(); // 秒數
  if (isNaN(sec)) sec = 0;
  newOptions['delayms'] = sec * 1000; // 設定為毫秒

  field.value = url.concat('?', getOptionsArrayFromObj(newOptions).join('&'));
}

// 真正設定 自動播放、循環播放、顯示控制列
// type = slide | photo
// param = start | loop | rm
function setStartOrLoopOrRm(type, param) {
  const field = urlFields[type];
  const optionElm = type === 'slide' ? slideOptions[param] : photoOptions[param];

  if(field.value.trim() === '') {
    optionElm.checked = false;
    return;
  }

  const [url, options] = field.value.split('?');
  const newOptions = getOptionsObj(options);

  const trueValue = param === 'rm' ? 'minimal' : true;
  const falseValue = param === 'rm' ? '' : false;
  newOptions[param] = optionElm.checked ? trueValue : falseValue; // 設定新值

  field.value = url.concat('?', getOptionsArrayFromObj(newOptions).join('&'));
}

// 將參數物件轉為陣列
function getOptionsArrayFromObj(obj) {
  // 參數陣列
  const optionsArray = [];
  for (let key in obj) {
    optionsArray.push(key.concat('=', obj[key]));
  }

  return optionsArray;
}

// 設定資料庫：資源 url
function setUrl(type) {
  showMsg(msgBlock, '處理中....', 'text-info');

  const field = urlFields[type];

  const payload = {
    url: field.value.trim(),
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }

  db.collection(`boards/${currentBoard.id}/urls`)
    .doc(type)
    .set(payload)
    .then(() => hideMsg(msgBlock, 0))
    .catch(consoleLogError);
}

// 更新資料庫：資源 timestamp，強制前台資源 reload
function reloadUrl(type) {
  showMsg(msgBlock, '處理中....', 'text-info');

  console.log('reload type: ' + type);
  const payload = {
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }

  db.collection(`boards/${currentBoard.id}/urls`)
    .doc(type)
    .update(payload)
    .then(() => hideMsg(msgBlock, 0))
    .catch(consoleLogError);
}