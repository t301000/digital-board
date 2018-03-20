# 簡易電子看板

# 規則

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