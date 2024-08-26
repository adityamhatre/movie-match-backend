import admin from "firebase-admin";
import { createRequire } from "module";
import dotenv from "dotenv";
dotenv.config();

let serviceAccount;
if (process.env.IS_LOCAL === false) {
  console.log("Using service account from hosted file");
  serviceAccount = require("/etc/secrets/movie-match-sak.json");
} else {
  console.log("Using service account from local file");
  const require = createRequire(import.meta.url);
  serviceAccount = require("./movie-match-sak.json");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

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
  const pairingData = getPairingKeyRef(likedBy, otherUser).get().data();

  if (!pairingData) {
    await getPairingKeyRef(likedBy, otherUser).set(
      { likes: [itemId] },
      { merge: true }
    );
    pairingData = { likes: [itemId] };
  }

  const currentLiked = new Set(pairingData["likes"]);
  currentLiked.add(itemId);
  let dataToBeUpserted = {
    likes: Array.from(currentLiked),
  };
  const res = await checkIfMatch(likedBy, otherUser, itemId);
  await getPairingKeyRef(likedBy, otherUser).set(dataToBeUpserted, {
    merge: true,
  });
  return res;
};

export const checkIfMatch = async (likedBy, otherUser, itemId) => {
  var pairings = (await getPairingKeyRef(likedBy, otherUser).get()).data();
  if (!pairings) {
    return { match: false };
  }

  var commonItems = new Set(pairings["likes"]);
  if (commonItems.has(itemId)) {
    const matches = pairings["matches"] ?? [];
    const matchesArray = Array.from(matches);
    const newMatches = Array.from(new Set(matchesArray.concat(itemId)));
    await getPairingKeyRef(likedBy, otherUser).set(
      {
        matches: newMatches,
      },
      { merge: true }
    );

    return { match: true, users: sortedUsers, itemId };
  }

  return { match: false };
};

const getPairingKeyRef = (user1, user2) => {
  var sortedUsers = [user1, user2].sort();
  var pairingKey = sortedUsers.join("");
  return db.collection("pairings").doc(pairingKey);
};
