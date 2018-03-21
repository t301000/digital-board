# 簡易電子看板
1. 不須後端程式
1. 資料庫使用 firestore
1. 解析度 1920x1080 或 1366x768
1. 使用 chrome 全螢幕呈現
1. 可展示素材：google 簡報、YouTube 播放清單

# 安裝
1. 複製 app/config.sample.js 為 app/config.js
1. 登入 [firebase](https://firebase.google.com) 並新增一專案，資料庫選擇 firestore
1. 取得專案設定值，填入 app/config.js
1. 瀏覽 /install，建立帳號
1. 瀏覽 /login，登入後即可建立看板

# firestore 規則設定

```
service cloud.firestore {
  match /databases/{database}/documents {
    
    match /boards/{board} {
      // 開放讀取
    	allow read;
      // 只有對該 board 有管理權者才能寫入
      allow write: if (request.auth.uid !=null) && exists(/databases/$(database)/documents/users/$(request.auth.uid)/boards/$(board));
      
      match /{document=**} {
      	allow read;
        allow write: if (request.auth.uid !=null) && exists(/databases/$(database)/documents/users/$(request.auth.uid)/boards/$(board));
      }
    }
    
    match /users/{uid} {
      // 只有 user 能讀寫自己的 document
    	allow read, write: if request.auth.uid == uid;
      
      match /{document=**} {
      	allow read, write: if request.auth.uid == uid;
      }
    }
    
    match /flags/{documents=**} {
      allow read;
      allow write: if false;
    } 
  }
}
```