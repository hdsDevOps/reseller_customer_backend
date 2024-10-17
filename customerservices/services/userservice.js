const { admin, db } = require("../firebaseConfig");
const { hashPassword } = require("../helper");

async function getCustomerEmails(data) {
  try {
    if (!data.id) {
      return { status: 400, message: "Missing customer ID" };
    }

    const customerDoc = await db.collection("customers").doc(data.id).get();

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
      !data.id ||
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
      customer_id: data.id,
      domain_id: data.domain_id,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      salt: salt,
      passwordHash: hash,
      is_admin: false,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    const customerRef = db.collection("customers").doc(data.id);
    await customerRef.update({
      emails: admin.firestore.FieldValue.arrayUnion(newEmail),
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
    if (!data.id || !data.rec_id) {
      return { status: 400, message: "Missing customer ID or email record ID" };
    }

    const customerRef = db.collection("customers").doc(data.id);
    const customerDoc = await customerRef.get();
    const emails = customerDoc.data().emails || [];
    const updatedEmails = emails.map((email) =>
      email.id === rec_id ? { ...email, isAdmin: true } : email
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
    if (!data.id || !data.rec_id || !data.password) {
      return { status: 400, message: "Missing required fields" };
    }

    const { salt, hash } = hashPassword(data.password);

    const customerRef = db.collection("customers").doc(data.id);
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

async function updateProfile(data) {
  try {
    if (!data.id) {
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

    await db.collection("customers").doc(data.id).update(updateData);

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
    if (!data.id || !data.product_id) {
      return { status: 400, message: "Missing customer ID or product ID" };
    }

    const customerRef = db.collection("customers").doc(data.id);
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
    if (!data.id || !data.currency_id) {
      return { status: 400, message: "Missing customer ID or currency ID" };
    }

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
    if (!data.id || !data.currency_id) {
      return { status: 400, message: "Missing customer ID or currency ID" };
    }

    const customerRef = db.collection("customers").doc(data.id);
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
};
