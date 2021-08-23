import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp(functions.config().firebase);
export const firestore = admin.firestore();

// プッシュ通知を送る関数
const sendPushNotification = async function (
    token: string,
    title: string,
    body: string,
    badge: string
) {
    const payload = {
        notification: {
            title: title,
            body: body,
            badge: badge,
            sound: "default",
        },
    };
    const option = {
        priority: "high",
    };
    // ここで実際に通知を送信している
    await admin.messaging().sendToDevice(token, payload, option);
};

// 新規依頼作時
export const createItList3 = functions
    .region("asia-northeast1")
    .firestore.document("itList/{docId}")
    .onCreate(async (snapshot, context) => {
        // ここにitListのデータが入っている(createdAt,ifText,thenText)

        const itList = snapshot.data();

        const receiverRef = firestore.collection("users").doc(itList["userId"]);
        // const receiverTokens =
        // 受信者の情報にアクセスする
        receiverRef.get().then(function (doc) {
            if (doc.exists === true) {
                // 受信者の情報を取得(name,fcmToken)
                // const receiver = doc.data();
                const fcmToken =
                    "eOHxYMFAHUjguDS1UsTg41:APA91bEaitT55pJFP2MrCh5iaF12_bzh-qVqVbyRNNelKasLyhbuXmuRSGEL1yi-BdNSoM18st8xxg8IDxohDbmmrOAcI-t7fNN5QIUUV4N4IfIWWgXoqd8ZeraaBJSR1xMREdwLvGEB";
                const ifText = itList["ifText"];
                const thenText = itList["thenText"];
                // 通知のタイトル
                const title = ifText;
                // 通知の内容
                const body = thenText;
                sendPushNotification(fcmToken, title, body, "1");
                console.log(ifText + thenText);
            } else {
                console.error("notExists");
            }
        });
    });
