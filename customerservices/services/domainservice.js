const { admin, db } = require("../firebaseConfig");
const { sendmail } = require("../helper");

async function adddomain(data) {
  try {
    if (
      !data.customer_id ||
      !data.domain_name ||
      !data.domain_type ||
      !data.subscription_id
    ) {
      return { status: 400, message: "Missing required fields" };
    }

    const newDomain = {
      customer_id: data.customer_id,
      domain_name: data.domain_name,
      domain_type: data.domain_type,
      subscription_id: data.subscription_id,      
      business_email: data.business_email,      
      license_usage: data.license_usage,
      plan: data.plan,      
      payment_method: data.payment_method,      
      domain_status: data.domain_status,      
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    };


    const docRef = await admin
      .firestore()
      .collection("domains")
      .add(newDomain);
    return {
      status: 200,
      message: "Domain added successfully",
      settingId: docRef.id,
    };
  } catch (error) {
    return {
      status: 500,
      message: "Error adding Domain",
      error: error.message,
    };
  }
}



module.exports = {
  adddomain,
}