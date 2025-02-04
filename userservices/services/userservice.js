const { admin, db, bucket } = require("../firebaseConfig");
const { hashPassword } = require("../helper");
const { v4: uuidv4 } = require('uuid');
const path = require('path');

async function getCustomerEmails(data) {
  try {
    if (!data.user_id || !data.domain_id) {
      return { status: 400, message: "Missing customer ID" };
    }

    const customerDoc = await db.collection("domains").doc(data.domain_id).get();

    if (!customerDoc.exists) {
      return res.status(404).json({ error: "Domain not found" });
    }

    const emails = customerDoc.data().emails || [];

    return { status: 200, emails };
  } catch (error) {
    console.error("Error in getCustomerEmails:", error);
    return {
      status: 500,
      message: "Error fetching customer emails",
      error: error.message,
    };
  }
}

async function addEmail(data) {
  try {
    if (
      !data.user_id ||
      !data.domain_id
    ) {
      return { status: 400, message: "Missing required fields" };
    }

    let existingEmails = [];
    const customerRef = db.collection("domains").doc(data.domain_id);
    const customerDoc = await customerRef.get();

    if (customerDoc.exists) {
      const customerData = customerDoc.data();
      if (customerData.emails) {
        existingEmails = customerData.emails;
      }
    }

    // Step 2: Compare with new emails
    const newEmails = data.emails;
    const emailsToProcess = [];
    let duplicateEmails = "";

    newEmails.forEach((email) => {
      const isDuplicate = existingEmails.some(existingEmail => existingEmail.email === email.email);
      if (isDuplicate) {
        duplicateEmails += `${email.email}; `;
      } else {
        emailsToProcess.push(email);
      }
    });
    emailsToProcess.forEach((email) => {
      const { salt, hash } = hashPassword(email.password);
      email.salt = salt;
      email.passwordHash = hash;
      email.uuid = email.hasOwnProperty("uuid") ? email.uuid : uuidv4().replace(/-/g, '');
      email.status = true;
    });


    await customerRef.update({
      emails: admin.firestore.FieldValue.arrayUnion(...data.emails),
      // emails: data.emails,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    if (duplicateEmails.length > 0) {
      return {
        status: 200,
        message: `Email added successfully.Duplicate email is there.`,
        email_id: customerRef.id
      }
    }
    return {
      status: 200,
      message: "Email added successfully",
      email_id: customerRef.id,
    };
  } catch (error) {
    console.error("Error in addEmail:", error);
    return { status: 500, message: "Error adding email", error: error.message };
  }
}

async function updateEmaliAccount(data) {
  try {
    if (!data.domain_id || !data.uuid) {
      return { status: 400, message: "Missing required fields" };
    }

    const customerRef = db.collection("domains").doc(data.domain_id);
    const customerDoc = await customerRef.get();
    const emails = customerDoc.data().emails || [];

    let upEmail = {};
    if (data.hasOwnProperty('first_name')) {
      upEmail.first_name = data.first_name;
    }
    if (data.hasOwnProperty('last_name')) {
      upEmail.last_name = data.last_name;
    }
    if (data.hasOwnProperty('email')) {
      upEmail.email = data.email;
    }
    if (data.hasOwnProperty('phone_no')) {
      upEmail.phone_no = data.phone_no;
    }
    if (data.hasOwnProperty('address')) {
      upEmail.address = data.address;
    }
    if (data.hasOwnProperty('state')) {
      upEmail.state = data.state;
    }
    if (data.hasOwnProperty('city')) {
      upEmail.city = data.city;
    }
    if (data.hasOwnProperty('country')) {
      upEmail.country = data.country;
    }
    if (data.hasOwnProperty('password')) {
      const { salt, hash } = hashPassword(data.password);
      upEmail.salt = salt;
      upEmail.passwordHash = hash;
    }


    const updatedEmails = emails.map((email) =>

      email.uuid === data.uuid ? { ...email, ...upEmail } : email
    );
    await customerRef.update({ emails: updatedEmails });

    return { status: 200, message: "Email updated successfully" };
  } catch (error) {
    console.error("Error in updateEmaliAccount:", error);
    return {
      status: 500,
      message: "Error updating email",
      error: error.message,
    };
  }
}
async function deleteEmaliAccount(data) {
  try {
    if (!data.domain_id || !data.uuid) {
      return { status: 400, message: "Missing required fields" };
    }

    const customerRef = db.collection("domains").doc(data.domain_id);
    const customerDoc = await customerRef.get();
    const emails = customerDoc.data().emails || [];


    const updatedEmails = emails.filter(email => email.uuid !== data.uuid);
    await customerRef.update({ emails: updatedEmails });

    return { status: 200, message: "Email deleted successfully" };
  } catch (error) {
    console.error("Error in deleteEmaliAccount:", error);
    return {
      status: 500,
      message: "Error deleting email",
      error: error.message,
    };
  }
}
async function makeEmailAdmin(data) {
  try {
    if (!data.domain_id || !data.rec_id) {
      return { status: 400, message: "Missing domain ID or email record ID" };
    }

    const customerRef = db.collection("domains").doc(data.domain_id);
    const customerDoc = await customerRef.get();
    const emails = customerDoc.data().emails || [];
    const updatedEmails = emails.map((response) =>
      response.email === data.rec_id ? { ...response, is_admin: true } : { ...response, is_admin: false }
    );
    await customerRef.update({ emails: updatedEmails });

    return { status: 200, message: "Email made admin successfully" };
  } catch (error) {
    console.error("Error in makeEmailAdmin:", error);
    return {
      status: 500,
      message: "Error making email admin",
      error: error.message,
    };
  }
}

async function resetEmailPassword(data) {
  try {
    if (!data.domain_id || !data.rec_id || !data.password) {
      return { status: 400, message: "Missing required fields" };
    }

    const { salt, hash } = hashPassword(data.password);

    const customerRef = db.collection("domains").doc(data.domain_id);
    const customerDoc = await customerRef.get();
    const emails = customerDoc.data().emails || [];

    const updatedEmails = emails.map((email) =>
      email.email === data.rec_id ? { ...email, salt, passwordHash: hash } : email
    );
    await customerRef.update({ emails: updatedEmails });

    return { status: 200, message: "Email password reset successfully" };
  } catch (error) {
    console.error("Error in resetEmailPassword:", error);
    return {
      status: 500,
      message: "Error resetting email password",
      error: error.message,
    };
  }
}
async function changeemailstatus(data) {
  try {
    if (!data.domain_id || !data.email) {
      return { status: 400, message: "Missing required fields" };
    }

    const customerRef = db.collection("domains").doc(data.domain_id);
    const customerDoc = await customerRef.get();
    const emails = customerDoc.data().emails || [];

    const updatedEmails = emails.map((em) =>
      em.email === data.email && em.is_admin != true ? { ...em, status: data.status } : em
    );
    if (updatedEmails.some((em) => em.email === data.email && em.is_admin == true)) {
      return { status: 400, message: "You do not have permission to change this status." };
    }
    await customerRef.update({ emails: updatedEmails });

    return { status: 200, message: "Email status change successfully" };
  } catch (error) {    
    return {
      status: 500,
      message: "Error change email status",
      error: error.message,
    };
  }
}

async function updateProfile(data) {
  try {
    if (!data.user_id) {
      return { status: 400, message: "Missing  ID" };
    }
    if (data.hasOwnProperty("is_staff") && data.is_staff == true) {
      return await updateStaffProfile(data);
    }
    const custRef = db.collection("customers").doc(data.user_id);
    const customerDoc = await custRef.get();
    const customerData = customerDoc.data();
    let business_phone_number = "";
    if (customerData.business_phone_number) {
      business_phone_number = customerData.business_phone_number;
    }
    const updateData = {
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      searchableIndex: [data.first_name.toLowerCase(), data.last_name.toLowerCase(), `${data.first_name.toLowerCase()} ${data.last_name.toLowerCase()}`, data.email.toLowerCase(), business_phone_number, data.phone_no]

    };

    const fields = [
      "first_name",
      "last_name",
      "email",
      "phone_no",
      "address",
      "state",
      "city",
      "country",
      "business_name",
      "business_state",
      "business_city",
      "zipcode",
    ];

    fields.forEach((field) => {
      if (data[field]) updateData[field] = data[field];
    });

    if (data.hasOwnProperty("password")) {
      if (data.password) {
        const { salt, hash } = hashPassword(data.password);
        updateData.salt = salt;
        updateData.passwordHash = hash;
      }
    }

    await custRef.update(updateData);

    return { status: 200, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Error in updateProfile:", error);
    return {
      status: 500,
      message: "Error updating profile",
      error: error.message,
    };
  }
}
async function addToCart(data) {
  try {
    if (!data.user_id || !data.products) {
      return { status: 400, message: "Missing customer ID or product ID" };
    }
    data.products.forEach((product) => {
      product.uuid = product.hasOwnProperty("uuid") ? product.uuid : uuidv4().replace(/-/g, '');
    });

    const customerRef = db.collection("customers").doc(data.user_id);
    await customerRef.update({
      cart: data.products
    });

    return { status: 200, message: "Product added to cart successfully" };
  } catch (error) {
    console.error("Error in addToCart:", error);
    return {
      status: 500,
      message: "Error adding product to cart",
      error: error.message,
    };
  }
}
async function cartList(data) {
  try {
    if (!data.user_id) {
      return { status: 400, message: "Missing customer ID" };
    }
    const customerDoc = await db.collection("customers").doc(data.user_id).get();
    const cart = customerDoc.data().cart || [];
    return { status: 200, message: "Cart list fatched successfully", cart };

  } catch (error) {
    console.error("Error in addToCart:", error);
    return {
      status: 500,
      message: "Error adding product to cart",
      error: error.message,
    };
  }
}

async function getCurrenciesList(data) {
  try {
    const currenciesSnapshot = await db.collection("currencies").get();
    const currencies = currenciesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { status: 200, currencies };
  } catch (error) {
    console.error("Error in getCurrenciesList:", error);
    return {
      status: 500,
      message: "Error fetching currencies",
      error: error.message,
    };
  }
}

async function updateCurrency(data) {
  try {
    if (!data.user_id || !data.currency_id) {
      return { status: 400, message: "Missing customer ID or currency ID" };
    }

    const customerRef = db.collection("customers").doc(data.user_id);
    await customerRef.update({ currency: data.currency_id });

    return { status: 200, message: "Currency updated successfully" };
  } catch (error) {
    console.error("Error in updateCurrency:", error);
    return {
      status: 500,
      message: "Error updating currency",
      error: error.message,
    };
  }
}

async function uploadimage(req, res) {
  try {
    if (!req.body.user_id) {
      return res.status(400).send({ status: "error", message: 'Missing user ID' });
    }
    if (!req.file) {
      return res.status(400).send({ status: "error", message: 'No file uploaded.' });
    }
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${Date.now()}-HDS${fileExtension}`;
    const file = bucket.file(fileName);

    // Create a write stream to Firebase Storage
    const blobStream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype, // Use the uploaded file's MIME type
      },
    });

    blobStream.on('error', (err) => {
      console.error(err);
      res.status(400).send({ status: "error", message: 'Error uploading file.' });
    });

    blobStream.on('finish', async () => {
      // Make the file publicly accessible
      await file.makePublic();

      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      if (req.body.is_staff == "true") {
        const customerRef = db.collection("users").doc(req.body.staff_id);
        await customerRef.update({ profile_image: publicUrl });
      } else {
        const customerRef = db.collection("customers").doc(req.body.user_id);
        await customerRef.update({ profile_image: publicUrl });
      }

      res.status(200).send({ message: 'File uploaded successfully!', url: publicUrl });
    });

    // End the stream by writing the file buffer
    blobStream.end(req.file.buffer);
  } catch (error) {
    console.error(error);
    res.status(400).send({ status: "error", message: 'Error handling file upload.' });
  }
  return res;
}

async function getCustomerProfileData(data) {
  try {
    if (!data.user_id) {
      return { status: 400, message: "Missing customer ID" };
    }

    const customerDoc = await db.collection("customers").doc(data.user_id).get();
    const customerData = customerDoc.data();


    if (data.hasOwnProperty('is_staff') && data.is_staff == true) {
      const staffDoc = await db.collection("users").doc(data.staff_id).get();
      const staffData = staffDoc.data();
      customerData.first_name = staffData.first_name;
      customerData.last_name = staffData.last_name;
      customerData.email = staffData.email;
      customerData.phone_no = staffData.phone_no;
      customerData.address = staffData.address;
      customerData.city = staffData.city;
      customerData.country = staffData.country;
      customerData.state = staffData.state;
      customerData.profile_image = staffData.profile_image ? staffData.profile_image : "";
    }


    return { status: 200, message: "customer profile data fetched successfully", customerData };
  } catch (error) {
    console.error("Error in getCustomerProfileData:", error);
    return {
      status: 500,
      message: "Error fetching customer profile data",
      error: error.message,
    };
  }
}

async function updateCards(data) {
  try {
    if (!data.user_id) {
      return { status: 400, message: "Missing customer ID" };
    }

    const customerRef = db.collection("customers").doc(data.user_id).get();
    const customerData = customerDoc.data();
    const existingCards = customerData.cards || []; // Retrieve existing cards, default to an empty array if not present 
    const newCard = data.card;

    if (!existingCards.includes(newCard)) {
      if (data.hasOwnProperty("card")) {
        data.card.forEach((car) => {
          data.card.uuid = car.hasOwnProperty("uuid") ? car.uuid : uuidv4().replace(/-/g, '');
        });
      }
      await customerRef.update({
        cards: admin.firestore.FieldValue.arrayUnion(data.card),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      return { status: 200, message: "Card already exists" };
    }

    return { status: 200, message: "Card updated successfully" };
  } catch (error) {
    console.error("Error in updateCards:", error);
    return {
      status: 500,
      message: "Error updating card",
      error: error.message,
    };
  }
}

async function getNotifications(data) {
  try {
    if (!data.user_id && !data.per_page && !data.is_read) {
      return { status: 400, message: "Missing customer ID or per page or read status" };
    }
    const per_page = data.per_page; // Adjust as needed
    let query = db.collection("notifications").where("customer_id", "==", data.user_id)
    if (data.hasOwnProperty("is_read") && (data.is_read != "" || data.is_read != null)) {
      query = query.where("is_read", "==", data.is_read);
    }

    query = query.orderBy("created_at", "desc").limit(per_page);
    if (data.last_id && data.last_id !== "") {
      const lastVisible = await db.collection("notifications").doc(data.last_id).get();
      if (lastVisible.exists) {
        query = query.startAfter(lastVisible);
      }
    }
    const customerDoc = await query.get();
    const notifications = customerDoc.docs.map(doc => ({
      id: doc.id, ...doc.data()
    }));
    return {
      status: 200,
      message: "customer notification fetched successfully",
      data: notifications,
      page: data.per_page
    };
  } catch (error) {
    console.error("Error in getNotifications:", error);
    return {
      status: 500,
      message: "Error fetching notifications",
      error: error.message,
    };
  }
}

async function updateNotificationReadStatus(data) {
  try {
    if (!data.is_read || !data.notification_id) {
      return { status: 400, message: "Missing status or notification ID" };
    }

    const notificationRef = db.collection("notifications").doc(data.notification_id);
    await notificationRef.update({ is_read: data.is_read });

    return { status: 200, message: "Notification read status updated successfully" };
  } catch (error) {
    console.error("Error in updateNotificationReadStatus:", error);
    return {
      status: 500,
      message: "Error updating notification read status",
      error: error.message,
    };
  }

}
async function makeNotificationStatusOnOff(data) {
  try {
    if (!data.user_id || !data.status) {
      return { status: 400, message: "Missing user ID" };
    }
    const querySnapshot = await db.collection("notification_settings").where("userId", "==", data.user_id).get();
    if (!querySnapshot.empty) {
      await Promise.all(querySnapshot.docs.map(doc => doc.ref.update({ status: data.status, updatedAt: admin.firestore.FieldValue.serverTimestamp() })));
      return { status: 200, message: "Notification setting updated successfully" };
    } else {
      querySnapshot.db.collection("notification_settings").add(
        {
          userId: data.user_id,
          status: data.status,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      return { status: 200, message: "Notification setting updated successfully" };
    }

  } catch (error) {
    console.error("Error in makeNotificationStatusOnOff:", error);
    return {
      status: 500,
      message: "Error updating notification setting status",
      error: error.message,
    };
  }

}
async function updateStaffProfile(data) {
  try {
    if (!data.user_id || !data.staff_id) {
      return { status: 400, message: "Missing  ID" };
    }

    const updateData = {
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };
    const custupdateData = {
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    const stafffields = [
      "first_name",
      "last_name",
      "email",
      "phone_no",
      "address",
      "state",
      "city",
      "country"
    ];
    const customerfields = [
      "business_name",
      "business_state",
      "business_city",
      "business_zip_code",
    ];

    stafffields.forEach((field) => {
      if (data[field]) updateData[field] = data[field];
    });
    customerfields.forEach((field) => {
      if (data[field]) custupdateData[field] = data[field];
    });

    if (data.hasOwnProperty("password")) {
      if (data.password) {
        const { salt, hash } = hashPassword(data.password);
        updateData.salt = salt;
        updateData.passwordHash = hash;
      }
    }

    await db.collection("users").doc(data.staff_id).update(updateData);
    await db.collection("customers").doc(data.user_id).update(custupdateData);

    return { status: 200, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Error in updateProfile:", error);
    return {
      status: 500,
      message: "Error updating profile",
      error: error.message,
    };
  }
}
module.exports = {
  getCustomerEmails,
  addEmail,
  makeEmailAdmin,
  resetEmailPassword,
  updateProfile,
  addToCart,
  getCurrenciesList,
  updateCurrency,
  changeemailstatus,
  updateEmaliAccount,
  deleteEmaliAccount,
  cartList,
  uploadimage,
  getCustomerProfileData,
  getNotifications,
  updateNotificationReadStatus,
  makeNotificationStatusOnOff
};
