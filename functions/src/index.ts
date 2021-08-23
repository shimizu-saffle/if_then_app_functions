import * as functions from "firebase-functions";
// セキュリティルールを無視できる管理者権限でアクセスするためのインポートとイニシャライズ
import * as admin from "firebase-admin";
admin.initializeApp(functions.config().functions);

let newIfThen;

// HTTPリクエストをトリガーに Cloud Firestore のイフゼンプランの情報を取得して返す関数
export const onCreateNotification = functions
    .region("asia-northeast1")
    .firestore.document("itList/{docId}")
    .onCreate(async (snapshot, context) => {
        const fcmTokens = [];

        newIfThen = snapshot.data();
        const newIfText = newIfThen.data()["ifText"];
        const newThenText = newIfThen.data()["thenText"];

        const tokens = await admin.firestore().collection("users").get();

        for (const token of tokens.docs) {
            fcmTokens.push(token.data()._tokens);
        }

        const payload = {
            notification: {
                title: newIfText,
                body: newThenText,
                sound: "default",
            },
        };
        try {
            const response = await admin
                .messaging()
                .sendToDevice(fcmTokens, payload);
            console.log("Notification sent succsessfully", response);
        } catch (err) {
            console.log("Error sending Notification.");
        }
    });
