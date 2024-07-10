const admin = require('firebase-admin');
const serviceAccount = require('./dev-hds-gworkspace-firebase-adminsdk-6ke7i-aab97fb726.json'); // replace with the path to your service account key JSON file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = db;