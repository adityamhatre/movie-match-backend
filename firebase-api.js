import admin from "firebase-admin";
import { createRequire } from "module";

let serviceAccount;
if (process.env.IS_LOCAL === false) {
  serviceAccount = require("/etc/secrets/movie-match-sak.json");
} else {
  const require = createRequire(import.meta.url);
  serviceAccount = require("./movie-match-sak.json");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

export const getCollection = async (collection) => {
  const snapshot = await db.collection(collection).get();
  const data = snapshot.docs.map((doc) => doc.data());
  return data;
};

export const addUser = async (uid, email, displayName) => {
  const docRef = db.collection("users").doc(uid);
  await docRef.set({
    uid,
    email,
    displayName,
  });
  return { uid, email, displayName };
};

export const getUsers = async (uid) => {
  const snapshot = await db.collection("users").get();
  const data = snapshot.docs
    .filter((i) => i.id !== uid)
    .map((doc) => doc.data());
  return data;
};

export const addItemLike = async (likedBy, otherUser, itemId) => {
  var sortedUsers = [likedBy, otherUser].sort();
  var pairingKey = sortedUsers.join("");

  const pairingData = (
    await db.collection("pairings").doc(pairingKey).get()
  ).data();

  if (!pairingData) {
    await db
      .collection("pairings")
      .doc(pairingKey)
      .set({ likes: [itemId] }, { merge: true });
    pairingData = { likes: [itemId] };
  }

  const currentLiked = new Set(pairingData["likes"]);
  currentLiked.add(itemId);
  let dataToBeUpserted = {
    likes: Array.from(currentLiked),
  };
  const res = await checkIfMatch(likedBy, otherUser, itemId);
  await db
    .collection("pairings")
    .doc(pairingKey)
    .set(dataToBeUpserted, { merge: true });
  return res;
};

export const checkIfMatch = async (likedBy, otherUser, itemId) => {
  var sortedUsers = [likedBy, otherUser].sort();
  var pairingKey = sortedUsers.join("");
  var pairings = (await db.collection("pairings").doc(pairingKey).get()).data();
  if (!pairings) {
    return { match: false };
  }

  var commonItems = new Set(pairings["likes"]);
  if (commonItems.has(itemId)) {
    const matches = pairings["matches"] ?? [];
    const matchesArray = Array.from(matches);
    const newMatches = Array.from(new Set(matchesArray.concat(itemId)));
    await db.collection("pairings").doc(pairingKey).set(
      {
        matches: newMatches,
      },
      { merge: true }
    );

    return { match: true, users: sortedUsers, itemId };
  }
  return { match: false };
};
