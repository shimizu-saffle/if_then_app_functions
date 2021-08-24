import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
export const firestore = admin.firestore();

// プッシュ通知を送る関数
const sendPushNotification = async function (
    token: string[],
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

export const remindIfThenNotificationTest = functions
    .region("asia-northeast1")
    .runWith({ memory: "512MB" })
    .pubsub.schedule("every 2 minutes")
    .timeZone("Asia/Tokyo")
    .onRun(async () => {
        // user全員に対して通知を送る事を表現する
        // まずは複数のユーザーにべた書きメッセで通知を送れるかテストする

        const pushUsersRef = firestore.collection("users");

        const usersSnapshot = await pushUsersRef.get();

        if (usersSnapshot.empty) {
            console.log("No matching documents.");
            return;
        }
        usersSnapshot.forEach((doc) => {
            console.log(doc.id, "=>", doc.data());
            console.log(doc.data()["postAt"]);
            //通知送信
            const tokens = doc.data()["tokens"];
            const title = "イフ";
            const body = "ゼン";
            sendPushNotification(tokens, title, body, "1");
        });
    });
