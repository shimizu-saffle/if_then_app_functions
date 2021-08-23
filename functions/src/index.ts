import * as functions from "firebase-functions";
// セキュリティルールを無視できる管理者権限でアクセスするためのインポートとイニシャライズ
import * as admin from "firebase-admin";
admin.initializeApp(functions.config().functions);

// イフゼンプランのonCreateをトリガーに Cloud Firestore のイフゼンプランの情報を取得して返す関数
export const onCreateNotification2 = functions
    .region("asia-northeast1")
    .firestore.document("itList/{docId}")
    .onCreate(async (snapshot) => {
        const fcmTokens = [];

        const newIfThen = snapshot.data();
        // const newIfText = newIfThen.doc("ifText");
        // const newThenText = newIfThen.data()["thenText"];

        const tokens = await admin.firestore().collection("users").get();

        for (const token of tokens.docs) {
            fcmTokens.push(token.data()._tokens);
        }

        const payload = {
            notification: {
                title: "Push Title",
                body: "Push Body",
                sound: "default",
            },
            date: {
                click_action: "FULUTTER_NOTIFICATION_CLICK",
                message: newIfThen.message,
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
