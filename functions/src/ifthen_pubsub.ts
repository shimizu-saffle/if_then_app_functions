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
    // ここで通知を送信している
    await admin.messaging().sendToDevice(token, payload, option);
};

// Cloud Functionsにデプロイ済み
export const remindIfThenNotification12 = functions
    .region("asia-northeast1")
    .runWith({ memory: "512MB" })
    .pubsub.schedule("0 12 * * *")
    .timeZone("Asia/Tokyo")
    .onRun(async () => {
        // user全員に対して通知を送るための記述

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

        usersSnapshot.forEach(async (doc) => {
            // Functionsのログにユーザーのメールアドレスとトークンが表示されてる
            console.log(doc.id, "=>", doc.data());
            console.log(doc.data()["postAt"]);
            const tokens = doc.data()["tokens"];
            const uid = doc.id;

            const ifThenRefUsers = await AllIfThenInfo.where(
                "userId",
                "==",
                uid
            ).get();

            ifThenRefUsers.forEach((doc) => {
                console.log(doc.id, "=>", doc.data());
                console.log(doc.data()["postAt"]);

                const title = doc.data()["ifText"];
                const body = doc.data()["thenText"];

                sendPushNotification(tokens, title, body, "1");
            });
        });
    });
