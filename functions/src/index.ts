import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp(functions.config().firebase);
export const firestore = admin.firestore();

// export * from "./ifthen_pubsub";

// プッシュ通知を送る関数
const sendPushNotification = functions
    .region("asia-northeast1")
    .runWith({ memory: "512MB" })
    .pubsub.schedule("every 2 minutes")
    .timeZone("Asia/Tokyo")
    .onRun(async () => {
        (token: string[], title: string, body: string, badge: string) => {
            const payload = {
                notification: {
                    body: body,
                    badge: badge,
                    sound: "default",
                },
            };
            const option = {
                priority: "high",
            };
            // ここで実際に通知を送信している
            admin.messaging().sendToDevice(token, payload, option);
        };
    });

// 新規依頼作時
export const createItList7test = functions
    .region("asia-northeast1")
    .firestore.document("itList/{docId}")
    // context消しても通知届いた上にすぐ通知が届くようになった
    .onCreate(async (snapshot) => {
        // ここにitListのデータが入っている(createdAt,ifText,thenText)
        const itList = snapshot.data();

        const receiverRef = firestore.collection("users").doc(itList["userId"]);
        receiverRef.get().then(function (doc) {
            if (doc.exists === true) {
                // usersの情報を取得(name,fcmTokens)
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const receiver = doc.data()!;
                const fcmTokens = receiver["tokens"];
                const ifText = itList["ifText"];
                const thenText = itList["thenText"];

                // 通知の内容
                const body = ifText + thenText;
                sendPushNotification(fcmTokens, body);
                console.log(ifText + thenText);
            } else {
                console.error("notExists");
            }
        });
    });
