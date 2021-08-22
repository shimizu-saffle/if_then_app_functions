import * as functions from "firebase-functions";
// セキュリティルールを無視できる管理者権限でアクセスするためのインポートとイニシャライズ
import * as admin from "firebase-admin";
admin.initializeApp();

// Firestoreからイフゼンプランの情報を取得して返す関数
export const fetchIfThen = functions.https.onRequest(
    async (request, response) => {
        try {
            // Firestoreへのアクセス情報を作る
            const db = admin.firestore();
            const doc = await db
                .collection("itList")
                // ドキュメントIDをベタ書きしてる
                .doc("H4zImloSqTgNZfXqYVkx")
                .get();
            // doc.data()で値が取得できる
            const ifThenInfo = doc.data();
            // イフゼンプランの情報を戻り値として返す
            response.send(ifThenInfo);
            // データベースから値の取得に失敗した際のエラーを防ぐために
            // try, catchでエラーハンドリングする
        } catch (e) {
            console.error(e);
            // こう書いておくとステータスコードを返却できる
            response.status(500).send(e);
        }
    }
);
