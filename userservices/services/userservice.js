const { admin, db } = require("../firebaseConfig");
const { hashPassword } = require("../helper");

async function getCustomerEmails(data) {
  try {
    if (!data.user_id) {
      return { status: 400, message: "Missing customer ID" };
    }

    const customerDoc = await db.collection("customers").doc(data.user_id).get();

    if (!customerDoc.exists) {
      return res.status(404).json({ error: "Customer not found" });
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
      !data.domain_id ||
      !data.first_name ||
      !data.last_name ||
      !data.email ||
      !data.password
    ) {
      return { status: 400, message: "Missing required fields" };
    }

    const { salt, hash } = hashPassword(data.password);

    const newEmail = {
      customer_id: data.user_id,
      domain_id: data.domain_id,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      salt: salt,
      passwordHash: hash,
      is_admin: false,
      statue:true      
    };

    const customerRef = await db.collection("domains").doc(data.domain_id);
    await customerRef.update({
      emails: admin.firestore.FieldValue.arrayUnion(newEmail),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

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

async function makeEmailAdmin(data) {
  try {
    if (!data.domain_id || !data.rec_id) {
      return { status: 400, message: "Missing domain ID or email record ID" };
    }

    const customerRef = db.collection("domains").doc(data.domain_id);
    const customerDoc = await customerRef.get();
    const emails = customerDoc.data().emails || [];
    const updatedEmails = emails.map((response) =>
      response.email === data.rec_id ? { ...response, is_admin: true } : response
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
      email.id === data.rec_id ? { ...email, salt, passwordHash: hash } : email
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
    console.log("object==================",data);
    if (!data.domain_id || !data.email) {
      return { status: 400, message: "Missing required fields" };
    }   

    const customerRef = db.collection("domains").doc(data.domain_id);
    const customerDoc = await customerRef.get();
    const emails = customerDoc.data().emails || [];

    const updatedEmails = emails.map((em) =>
      em.email === data.email ? { ...em, status: data.status } : em
    );
    await customerRef.update({ emails: updatedEmails });

    return { status: 200, message: "Email status change successfully" };
  } catch (error) {
    console.error("Error in change status:", error);
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
      return { status: 400, message: "Missing customer ID" };
    }

    const updateData = {
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    const fields = [
      "firstname",
      "lastname",
      "email",
      "phone",
      "address",
      "state",
      "country",
      "business_name",
      "business_state",
      "business_city",
      "business_zipcode",
    ];

    fields.forEach((field) => {
      if (data[field]) updateData[field] = data[field];
    });

    if (data.password) {
      const { salt, hash } = hashPassword(data.password);
      updateData.salt = salt;
      updateData.passwordHash = hash;
    }

    await db.collection("customers").doc(data.user_id).update(updateData);

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
    if (!data.user_id || !data.product_id) {
      return { status: 400, message: "Missing customer ID or product ID" };
    }

    const customerRef = db.collection("customers").doc(data.user_id);
    await customerRef.update({
      cart: admin.firestore.FieldValue.arrayUnion(product_id),
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

module.exports = {
  getCustomerEmails,
  addEmail,
  makeEmailAdmin,
  resetEmailPassword,
  updateProfile,
  addToCart,
  getCurrenciesList,
  updateCurrency,
  changeemailstatus
};
