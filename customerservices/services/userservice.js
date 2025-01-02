const { messaging } = require("firebase-admin");
const { admin, db } = require("../firebaseConfig");
const { hashPassword } = require("../helper");
const { v4: uuidv4 } = require('uuid');



async function addEmail(data) {
  try {
    if (
      !data.user_id ||
      !data.domain_id
    ) {
      return { status: 400, message: "Missing required fields" };
    }



    data.emails.forEach((email) => {
      const { salt, hash } = hashPassword(email.password);
      email.salt = salt;
      email.passwordHash = hash;
      email.uuid = email.hasOwnProperty("uuid") ? email.uuid : uuidv4().replace(/-/g, '');
    });

    const customerRef = db.collection("domains").doc(data.domain_id);
    await customerRef.update({
      emails: admin.firestore.FieldValue.arrayUnion(...data.emails),
      // emails: data.emails,
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
    if (!data.id || !data.rec_id) {
      return { status: 400, message: "Missing customer ID or email record ID" };
    }

    const customerRef = db.collection("domains").doc(data.id);
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

    const customerRef = db.collection("domains").doc(data.id);
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
    if (!data.user_id) {
      return { status: 400, message: "Missing customer ID" };
    }

    const updateData = {
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
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
      "business_zip_code",
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
    if (!data.user_id || !data.products) {
      return { status: 400, message: "Missing customer ID or product ID" };
    }
    products.forEach((product) => {
      product.hasOwnProperty("uuid") ? product.uuid : uuidv4().replace(/-/g, '');
    });
    const customerRef = db.collection("customers").doc(data.user_id);
    await customerRef.update({
      cart: admin.firestore.FieldValue.arrayUnion(products),
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

async function updateCards(data) {
  try {
    if (!data.user_id) {
      return { status: 400, message: "Missing customer ID" };
    }

    const customerRef = db.collection("customers").doc(data.user_id);    
    const customerDoc = await customerRef.get();
    const customerData = customerDoc.data();

   
    const existingCards = customerData.cards || [];
    const newCard = data.card[0]; 

    // Check if the new card already exists in the existingCards array
    const cardExists = existingCards.some(card => card.card_id === newCard.card_id);

    if (!cardExists) {
      // If the new card doesn't have a uuid, generate one
      if (!newCard.hasOwnProperty("uuid")) {
        newCard.uuid = uuidv4().replace(/-/g, '');
      }

      // Update the customer document with the new card
      await customerRef.update({
        cards: admin.firestore.FieldValue.arrayUnion(newCard),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { status: 200, message: "Card updated successfully" };
    } else {
      return { status: 200, message: "Card already exists" };
    }

  } catch (error) {
    console.error("Error in updateCards:", error);
    return {
      status: 500,
      message: "Error updating card",
      error: error.message,
    };
  }
}

async function getCustomerCards(data) {
  try {
    if (!data.user_id) {
      return { status: 400, message: "Missing customer ID" };
    }

    const customerRef = db.collection("customers").doc(data.user_id);
    const customerDoc = await customerRef.get();
    const customerData = customerDoc.data();

    const cards = customerData.cards || [];
    return { status: 200,message:"List of cards fetching successfully", cards };
  } catch (error) {
    console.error("Error in getCustomerCards:", error);
    return {
      status: 500,
      message: "Error fetching customer cards",
      error: error.message,
    };
  }
  
}

module.exports = {
  addEmail,
  makeEmailAdmin,
  resetEmailPassword,
  updateProfile,
  addToCart,
  getCurrenciesList,
  updateEmaliAccount,
  deleteEmaliAccount,
  updateCards,
  getCustomerCards

};
