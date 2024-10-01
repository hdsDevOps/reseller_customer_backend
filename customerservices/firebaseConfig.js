// firebaseConfig.js
const admin = require("firebase-admin");
const serviceAccount = require("./dev-hds-gworkspace-firebase-adminsdk-6ke7i-aab97fb726.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { admin, db };
