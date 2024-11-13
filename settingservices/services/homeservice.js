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

async function addStaff(data) {
  try {
    // Input validation
    if (
      !data.user_id ||
      !data.first_name ||
      !data.last_name ||
      !data.email ||
      !data.phone_no ||
      !data.user_type_id
    ) {
      return { status: 400, message: "Missing required fields" };
    }

    // Check if email already exists
    const emailCheck = await db
      .collection("users")
      .where("email", "==", data.email)
      .get();

    if (!emailCheck.empty) {
      return { status: 400, message: "Email already exists" };
    }

    // Create new staff document
    const newStaff = {
      customer_id: data.user_id,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone_no: data.phone_no,
      user_type_id: data.user_type_id,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("users").add(newStaff);

    // Send welcome email
    const emailData = {
      email: data.email,
      subject: "Welcome to Our Platform",
      body: `
        <h2>Welcome ${data.first_name} ${data.last_name}!</h2>
        <p>Your account has been created successfully.</p>
        <p>Please contact your administrator for login credentials.</p>
      `,
    };

    await sendmail(emailData);

    return {
      status: 200,
      message: "Staff added successfully",
      id: docRef.id,
    };
  } catch (error) {
    console.error("Error in addStaff:", error);
    return {
      status: 500,
      message: "Error adding staff",
      error: error.message,
    };
  }
}

async function getStaffList(data) {
  try {
    if (!data.user_id || !data.user_type_id) {
      return { status: 400, message: "Missing required fields" };
    }

    let query = db
      .collection("users")
      .where("customer_id", "==", data.user_id)
      .where("user_type_id", "==", data.user_type_id);

    // Search functionality if search_text is provided
    if (data.search_text) {
      const searchText = data.search_text.toLowerCase();
      query = query.where("searchableIndex", "array-contains", searchText);
    }

    const staffSnapshot = await query.get();

    const staffList = staffSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at ? doc.data().created_at.toDate() : null,
    }));

    return {
      status: 200,
      message: "Staff list retrieved successfully",
      data: staffList,
    };
  } catch (error) {
    console.error("Error in getStaffList:", error);
    return {
      status: 500,
      message: "Error retrieving staff list",
      error: error.message,
    };
  }
}

async function editStaff(data) {
  try {
    if (
      !data.id ||
      !data.first_name ||
      !data.last_name ||
      !data.email ||
      !data.phone_no ||
      !data.user_type_id
    ) {
      return { status: 400, message: "Missing required fields" };
    }

    const staffRef = db.collection("users").doc(data.id);
    const doc = await staffRef.get();

    if (!doc.exists) {
      return { status: 404, message: "Staff record not found" };
    }

    await staffRef.update({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone_no: data.phone_no,
      user_type_id: data.user_type_id,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      status: 200,
      message: "Staff record updated successfully",
    };
  } catch (error) {
    console.error("Error in editStaff:", error);
    return {
      status: 500,
      message: "Error updating staff record",
      error: error.message,
    };
  }
}

async function deleteStaff(data) {
  try {
    if (!data.id) {
      return { status: 400, message: "Missing staff ID" };
    }

    const staffRef = db.collection("users").doc(data.id);
    const doc = await staffRef.get();

    if (!doc.exists) {
      return { status: 404, message: "Staff record not found" };
    }

    await staffRef.delete();

    return {
      status: 200,
      message: "Staff record deleted successfully",
    };
  } catch (error) {
    console.error("Error in deleteStaff:", error);
    return {
      status: 500,
      message: "Error deleting staff record",
      error: error.message,
    };
  }
}

async function getPaymentMethods() {
  try {
    const paymentMethodsSnapshot = await db.collection("payment_methods").get();
    const paymentMethods = paymentMethodsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      status: 200,
      message: "Payment methods retrieved successfully",
      data: paymentMethods,
    };
  } catch (error) {
    console.error("Error in getPaymentMethods:", error);
    return {
      status: 500,
      message: "Error retrieving payment methods",
      error: error.message,
    };
  }
}

async function updatePaymentMethod(data) {
  try {
    if (!data.id || !data.payment_method_id) {
      return { status: 400, message: "Missing required fields" };
    }

    const customerRef = db.collection("customers").doc(data.id);
    const doc = await customerRef.get();

    if (!doc.exists) {
      return { status: 404, message: "Customer not found" };
    }

    await customerRef.update({
      payment_method_id: data.payment_method_id,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      status: 200,
      message: "Payment method updated successfully",
    };
  } catch (error) {
    console.error("Error in updatePaymentMethod:", error);
    return {
      status: 500,
      message: "Error updating payment method",
      error: error.message,
    };
  }
}

async function getBillingHistory(data) {
  try {
    if (
      !data.id ||
      !data.start_date ||
      !data.end_date ||
      !data.domain ||
      !data.page_no
    ) {
      return { status: 400, message: "Missing required fields" };
    }

    const pageSize = 10; // Adjust as needed
    const startAt = (data.page_no - 1) * pageSize;

    let query = db
      .collection("billing_history")
      .where("customer_id", "==", data.id)
      .where("domain", "==", data.domain)
      .where("date", ">=", new Date(data.start_date))
      .where("date", "<=", new Date(data.end_date))
      .orderBy("date", "desc")
      .limit(pageSize)
      .offset(startAt);

    const billingHistorySnapshot = await query.get();
    const billingHistory = billingHistorySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
    }));

    return {
      status: 200,
      message: "Billing history retrieved successfully",
      data: billingHistory,
      page: data.page_no,
      pageSize: pageSize,
    };
  } catch (error) {
    console.error("Error in getBillingHistory:", error);
    return {
      status: 500,
      message: "Error retrieving billing history",
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
  addStaff,
  getStaffList,
  editStaff,
  deleteStaff,
  getPaymentMethods,
  updatePaymentMethod,
  getBillingHistory,
};


