const admin = require('../firebaseConfig');

async function submitContactForm(data) {
  try {
    // Store contact form data in Firestore
    await admin.firestore().collection('contactForms').add({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone_no: data.phone_no,
      subject: data.subject,
      message: data.message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send email with contact form data (you'll need to implement this part)
    await sendContactFormEmail(data);

    return { status: 200, message: 'Contact form submitted successfully' };
  } catch (error) {
    return { status: 400, message: 'Error submitting contact form', error: error.message };
  }
}

async function getSettings(data) {
  try {
    const settingsSnapshot = await admin.firestore().collection('settings')
      .where('user_type', '==', data.user_type)
      .where('user_id', '==', data.user_id)
      .get();

    const settings = settingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { status: 200, settings };
  } catch (error) {
    return { status: 400, message: 'Error retrieving settings', error: error.message };
  }
}

async function addSetting(data) {
  try {
    const newSetting = {
      user_type: data.user_type,
      user_id: data.user_id,
      permissions: data.permissions,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await admin.firestore().collection('settings').add(newSetting);
    return { status: 200, message: 'Setting added successfully', settingId: docRef.id };
  } catch (error) {
    return { status: 400, message: 'Error adding setting', error: error.message };
  }
}

async function editSetting(data) {
  try {
    await admin.firestore().collection('settings').doc(data.id).update({
      permissions: data.permissions,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { status: 200, message: 'Setting updated successfully' };
  } catch (error) {
    return { status: 400, message: 'Error updating setting', error: error.message };
  }
}

async function deleteSetting(data) {
  try {
    await admin.firestore().collection('settings').doc(data.id).delete();
    return { status: 200, message: 'Setting deleted successfully' };
  } catch (error) {
    return { status: 400, message: 'Error deleting setting', error: error.message };
  }
}

// Helper function (to be implemented)
// async function sendContactFormEmail(data) {