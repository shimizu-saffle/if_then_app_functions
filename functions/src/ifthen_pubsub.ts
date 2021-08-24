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

export const remindIfThenNotificationTest2 = functions
    .region("asia-northeast1")
    .runWith({ memory: "512MB" })
    .pubsub.schedule("every 2 minutes")
    .timeZone("Asia/Tokyo")
    .onRun(async () => {
        // user全員に対して通知を送るための記述
        // まずは複数のユーザーにべた書きメッセで通知を送れるかテストする→テスト完了

        const pushUsersRef = firestore.collection("users");
        const AllIfThenInfo = firestore.collection("itList");

        const usersSnapshot = await pushUsersRef.get();
        const itListSnapshot = await AllIfThenInfo.get();

        if (usersSnapshot.empty) {
            console.log("No matching　users documents.");
            return;
        }
        if (itListSnapshot.empty) {
            console.log("No matching　ifthen documents.");
            return;
        }

        usersSnapshot.forEach((doc) => {
            // Functionsのログにユーザーのメールアドレスとトークンが表示されてる
            console.log(doc.id, "=>", doc.data());
            console.log(doc.data()["postAt"]);
            const tokens = doc.data()["tokens"];

            itListSnapshot.forEach((doc) => {
                console.log(doc.id, "=>", doc.data());
                console.log(doc.data()["postAt"]);

                const title = doc.data()["ifText"];
                const body = doc.data()["thenText"];
                // この関数で通知を送信してる
                sendPushNotification(tokens, title, body, "1");
            });
        });
    });
