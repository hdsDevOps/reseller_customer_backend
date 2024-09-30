const { admin, db } = require("../firebaseConfig");
const { sendmail } = require("../helper");

async function submitContactForm(data) {
  try {
    // Input validation
    if (
      !data.first_name ||
      !data.last_name ||
      !data.email ||
      !data.phone_no ||
      !data.subject ||
      !data.message
    ) {
      return { status: 400, message: "Missing required fields" };
    }

    // Store contact form data in Firestore
    const docRef = await db.collection("contactForms").add({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone_no: data.phone_no,
      subject: data.subject,
      message: data.message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send email with contact form data
    const emailData = {
      email: process.env.ADMIN_EMAIL, // Send to admin email
      subject: `New Contact Form Submission: ${data.subject}`,
      body: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.first_name} ${data.last_name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone_no}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>Message:</strong> ${data.message}</p>
      `,
    };

    await sendmail(emailData);

    return {
      status: 200,
      message: "Contact form submitted successfully",
      id: docRef.id,
    };
  } catch (error) {
    console.error("Error in submitContactForm:", error);
    return {
      status: 500,
      message: "Error submitting contact form",
      error: error.message,
    };
  }
}

async function getSettings(data) {
  try {
    if (!data.user_type || !data.user_id) {
      return { status: 400, message: "Missing user_type or user_id" };
    }

    const settingsSnapshot = await admin
      .firestore()
      .collection("settings")
      .where("user_type", "==", data.user_type)
      .where("user_id", "==", data.user_id)
      .get();

    const settings = settingsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { status: 200, settings };
  } catch (error) {
    return {
      status: 500,
      message: "Error retrieving settings",
      error: error.message,
    };
  }
}

async function addSetting(data) {
  try {
    if (!data.user_type || !data.user_id || !Array.isArray(data.permissions)) {
      return { status: 400, message: "Invalid input data" };
    }

    const newSetting = {
      user_type: data.user_type,
      user_id: data.user_id,
      permissions: data.permissions,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await admin
      .firestore()
      .collection("settings")
      .add(newSetting);
    return {
      status: 200,
      message: "Setting added successfully",
      settingId: docRef.id,
    };
  } catch (error) {
    return {
      status: 500,
      message: "Error adding setting",
      error: error.message,
    };
  }
}

async function editSetting(data) {
  try {
    if (!data.id || !Array.isArray(data.permissions)) {
      return { status: 400, message: "Invalid input data" };
    }

    const settingRef = db.collection("settings").doc(data.id);
    const doc = await settingRef.get();

    if (!doc.exists) {
      return { status: 404, message: "Setting not found" };
    }

    await settingRef.update({
      permissions: data.permissions,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { status: 200, message: "Setting updated successfully" };
  } catch (error) {
    return {
      status: 500,
      message: "Error updating setting",
      error: error.message,
    };
  }
}

async function deleteSetting(data) {
  try {
    if (!data.id) {
      return { status: 400, message: "Missing setting ID" };
    }

    const settingRef = db.collection("settings").doc(data.id);
    const doc = await settingRef.get();

    if (!doc.exists) {
      return { status: 404, message: "Setting not found" };
    }

    await settingRef.delete();
    return { status: 200, message: "Setting deleted successfully" };
  } catch (error) {
    console.error("Error in deleteSetting:", error);
    return {
      status: 500,
      message: "Error deleting setting",
      error: error.message,
    };
  }
}

module.exports = {
  submitContactForm,
  getSettings,
  addSetting,
  editSetting,
  deleteSetting,
};
