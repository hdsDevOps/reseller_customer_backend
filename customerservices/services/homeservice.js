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

    const contactSnap = await db.collection("cms").doc("contact_us").get();
    const contactData = [{ ...contactSnap.data() }];


    // Send email with contact form data
    const emailData = {
      email: contactData.email, // Send to admin email
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
      !data.id ||
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
      customer_id: data.id,
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
    if (!data.id || !data.user_type_id) {
      return { status: 400, message: "Missing required fields" };
    }

    let query = db
      .collection("users")
      .where("customer_id", "==", data.id)
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
async function addBillingData(data) {
  try {
    // Input validation
    if (
      !data.user_id ||
      !data.transaction_id ||
      !data.invoice) {
      return { status: 400, message: "Missing required fields" };
    }
    // Create new staff document
    const newBill = {
      user_id: data.user_id,
      date: new Date(data.date),
      transaction_id: data.transaction_id,
      invoice: data.invoice,
      product_type: data.product_type,
      description: data.description,
      domain: data.domain,
      payment_method: data.payment_method,
      payment_status: data.payment_status,
      amount: data.amount,
      transaction_data: data.transaction_data,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("billing_history").add(newBill);


    return {
      status: 200,
      message: "Bill data added successfully",
      id: docRef.id,
    };
  } catch (error) {
    console.error("Error in addBillingData:", error);
    return {
      status: 500,
      message: "Error adding bill",
      error: error.message,
    };
  }
}

async function getBillingHistory(data) {
  try {
    if (
      !data.user_id
    ) {
      return { status: 400, message: "Missing required fields" };
    }

    // const pageSize = 10; // Adjust as needed
    // const startAt = (data.page_no - 1) * pageSize;

    let query = db
      .collection("billing_history")
      .where("user_id", "==", data.user_id);
    if (data.hasOwnProperty("domain") && data.domain != "") {
      query = query.where("domain", "==", data.domain);
    }
    if (data.hasOwnProperty("start_date") && data.start_date != "" && data.hasOwnProperty("end_date") && data.end_date != "") {
      query = query.where("created_at", ">=", new Date(data.start_date)).where("created_at", "<=", new Date(data.end_date));
    }
    query = query.orderBy("created_at", "desc");
    // .limit(pageSize)
    // .offset(startAt);

    const billingHistorySnapshot = await query.get();
    const billingHistory = billingHistorySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().created_at.toDate(),
    }));

    return {
      status: 200,
      message: "Billing history retrieved successfully",
      data: billingHistory
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
async function getsubscriptiondata(data) {
  try {
    let query = "";
    if (data.subscription_id != "") {
      query = db
        .collection("subscription_plans").doc(data.subscription_id);
    } else {
      query = db
        .collection("subscription_plans");
    }


    const subscription = await query.get();
    let subscriptionData = "";
    if (data.subscription_id != "") {
      subscriptionData = [{ id: data.subscription_id, ...subscription.data() }];
    } else {
      subscriptionData = subscription.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }
    return {
      status: 200,
      message: "subscription data retrieved successfully",
      data: subscriptionData
    };
  } catch (error) {
    console.error("Error in getsubscriptiondata:", error);
    return {
      status: 500,
      message: "Error retrieving subscription data",
      error: error.message,
    };
  }
}

async function getfaqs() {
  try {
    const faqs = await db.collection("faqs").orderBy("order", "asc").get();
    const faqsdata = faqs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      status: 200,
      message: "FAQs retrieved successfully",
      data: faqsdata,
    };
  } catch (error) {
    console.error("Error in getfaqs:", error);
    return {
      status: 500,
      message: "Error retrieving FAQs",
      error: error.message,
    };
  }
}
async function gethomedata() {
  try {
    let data = {};
    const document = await db.collection("cms").get();
    const documentdata = document.docs.reduce((acc, doc) => {
      acc[doc.id] = { ...doc.data() };
      return acc;
    }, {});


    return {
      status: 200,
      message: "data retrieved successfully",
      data: documentdata,
    };
  } catch (error) {
    console.error("Error in gethomedata:", error);
    return {
      status: 500,
      message: "Error retrieving data",
      error: error.message,
    };
  }
}
async function getBanners() {
  try {
    let data = {};
    const document = await db.collection("banners").where("active", "==", true).get();

    const documentdata = document.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));


    // const documentdata = document.docs.reduce((acc, doc) => {
    //   acc[doc.id] = { ...doc.data() };
    //   return acc;
    // }, {});


    return {
      status: 200,
      message: "data retrieved successfully",
      data: documentdata,
    };
  } catch (error) {
    console.error("Error in getBanners:", error);
    return {
      status: 500,
      message: "Error retrieving data",
      error: error.message,
    };
  }
}
async function getPromotionList(data) {
  // try {
    const today = new Date();
    let snapref = db.collection("promotions");
    const snapData = await snapref.where('end_date', '<', today).get();
    if (!snapData.empty) {
      let batch = db.batch();
      snapData.forEach(doc => {
        const docRef = snapref.doc(doc.id);
        batch.update(docRef, { status: false });
      });
      await batch.commit();
    }

    snapref = db.collection("promotions").where("status", "==", true);
    if (data.hasOwnProperty("promotion_id") && data.promotion_id != "" && data.promotion_id != null) {
      const specificDocRef = db.collection("promotions").doc(data.promotion_id);
      const doc = await specificDocRef.get();
      if (!doc.exists) {
        throw new Error("Promotion not found");
      }
      return {
        id: doc.id,
        ...doc.data(),
      };
    }
    const snapshot = await snapref.get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

  // } catch (error) {
  //   console.error("Error in getPromotionList:", error);
  //   return {
  //     status: 500,
  //     message: "Error retrieving data",
  //     error: error.message,
  //   };
  // }
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
  getsubscriptiondata,
  getfaqs,
  gethomedata,
  getBanners,
  addBillingData,
  getPromotionList
};


