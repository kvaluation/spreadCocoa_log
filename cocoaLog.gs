function spreadMailAttachedCocoaLogZip() {

 //■■　添付ファイル保存先の設定　■■
 // ☆メール添付されるcocoa_log.zipを保存するGoogle DriveのフォルダーID
 const attachedFileFolderID = '1KAtNXjzXtC92OfwQ6Ccw-mVkC_J6-QI5'
 //1KAtNXjzXtC92OfwQ6Ccw-mVkC_J6-QI5　は　kval.jp/mydrive/10_ENmyDrive/Attached, 従前のkenji.haruと共有

 //■■　gmail検索条件の設定　■■
 // ☆ 受信メールにcocoaLogのラベルをつけるようにし、添付ファイルあり、スター付き、ラベルcocoaLogの条件で受信メールを検索
 let condition;
 condition = "has:attachment";  //添付あり
 condition += " is:starred label:cocoaLog"  //スター付き & cocoaLogラベル（gmailのフィルターで添付ファイルにスターを付けておく。）

 const search_mail = GmailApp.search(condition);
 const messages = GmailApp.getMessagesForThreads(search_mail);　//messagesは配列
  
  console.log(condition);

 //■■　検索条件conditionでの検索と保存　■■ 
 const attachedFileFolder = DriveApp.getFolderById(attachedFileFolderID);
  
  for(var i = 0; i < messages.length; i++) { //検索結果を一つずつ取り出す
   
    for(var j = 0; j < messages[i].length; j++) { //スレッドの場合ここを複数回実行
     
      const attach = messages[i][j].getAttachments();
      const day = messages[i][j].getDate(); //取り出したメールの日付を取得
      const strDay = Utilities.formatDate(day , "JST", "yyyy_MM_dd");
      const senderName = messages[i][j].getFrom();//取り出したメールの送信者名を取得
      const message = messages[i][j];
     
        for(let k = 0; k < attach.length; k++){
          
         const attachedName = attach[k].getName();
         const filename = strDay + '_' + senderName + '_' + attachedName;　//保存ファイル名（受信日+送信者+添付ファイル名）

         const targetFile = attachedFileFolder.createFile(attach[k]); //ファイル保存

         targetFile.setName(filename); //ファイル名を保存ファイル名へ変更

         const attachedFileID = targetFile.getId() ;

         console.log("送信者: ",senderName, "受信日: ",day, "添付ファイル名: ",attachedName);
         console.log("メッセージID: ",message.getId(), "メッセージリンク: ",message.getThread().getPermalink());

            //■■　保存したzipファイルのcsvを新しいスプレッドシートに展開　■■ 
           const zipFile = DriveApp.getFileById(attachedFileID);
           const blobs = Utilities.unzip(zipFile.getBlob());
           const ssName = zipFile.getName();
           const spreadSheet = SpreadsheetApp.create(ssName);//取り違えのないようにメアドまで含めるため取り扱い注意

            for (const blob of blobs) {
    
             const csv = blob.getDataAsString();
             const shName = blob.getName(); //cocoaが動作情報のcsvに付する名前。照合日
             const sheet = spreadSheet.insertSheet(shName);
             const values = Utilities.parseCsv(csv);
             sheet.getRange(1, 1, values.length, values[0].length).setValues(values);

            }

            console.log(spreadSheet.getUrl());

        }

     
      messages[i][j].unstar(); //処理済みのメッセージのスターを外す。（Gmailで☆着色が残っていたりする）

    }

  }

   
}

// 参考
// 高橋宣成『詳解！Google AppsScript完全入門』初版，第２版
// https://note.com/bets_inc/n/n222ac80b9cc6
// http://www.initialsite.com/w01/14041
// https://tonari-it.com/gas-gmail-isstarred-star/
// https://tonari-it.com/gas-google-drive-file-folder-id/
// https://negimochi.work/gas-google-drive/