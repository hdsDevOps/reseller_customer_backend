const { admin, db } = require("../firebaseConfig");
const { sendmail } = require("../helper");

async function adddomain(data) {
  try {
    if (
      !data.customer_id ||
      !data.domain_name ||
      !data.domain_type ||
      !data.subscription_id||
      !data.data.business_email||
      !data.data.license_usage||
      !data.data.plan||
      !data.data.payment_method||
      !data.data.domain_status||
      !data.data.billing_period||
      !data.data.renew_status||
      !data.data.subscription_status
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
      billing_period:data.billing_period,
      auto_renew_status:data.renew_status,
      subscription_status:data.subscription_status,
      is_deleted: false,
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

async function domainlist(data) {
  try {
    if (!data.customer_id) {
      return { status: 400, message: "Missing required fields" };
    }
    let domain = [];
    let domains_data = [];   
       domain = await db.collection("domains").where("customer_id", "==", data.customer_id).where("is_deleted", "==", false).get();
        
      domains_data = domain.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
   

    return { status: 200, msg: "Domains fetched successfully", data: domains_data };
  } catch (error) {
    return {
      status: 500,
      message: "Error fetched Domain",
      error: error.message,
    };
  }
}
async function deletedomain(data) {
  try {
    if (!data.domain_id) {
      return { status: 400, message: "Missing required fields" };
    }
    await db.collection("domains").doc(data.domain_id).update({
      is_deleted: true,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { status: 200, msg: "Domain deleted successfully" };
  } catch (error) {
    return {
      status: 500,
      message: "Error delete domain",
      error: error.message,
    };
  }
}
async function changedomaintype(data) {
  try {
    if (!data.domain_id || !data.domain_type) {
      return { status: 400, message: "Missing required fields" };
    }
    await db.collection("domains").doc(data.domain_id).update({
      domain_type: data.domain_type,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { status: 200, msg: "Domain type changed successfully" };
  } catch (error) {
    return {
      status: 500,
      message: "Error Domain type changed ",
      error: error.message,
    };
  }
}
async function changerenewstatus(data) {
  try {
    if (!data.domain_id || !data.renew_status) {
      return { status: 400, message: "Missing required fields" };
    }
    await db.collection("domains").doc(data.domain_id).update({
      auto_renew_status: data.renew_status,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { status: 200, msg: "Domain renew status changed successfully" };
  } catch (error) {
    return {
      status: 500,
      message: "Error Domain type changed ",
      error: error.message,
    };
  }
}
async function changesubscriptionstatus(data) {
  try {
    if (!data.domain_id || !data.subscription_status) {
      return { status: 400, message: "Missing required fields" };
    }
    await db.collection("domains").doc(data.domain_id).update({
      subscription_status: data.subscription_status,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { status: 200, msg: "Domain subscription status changed successfully" };
  } catch (error) {
    return {
      status: 500,
      message: "Error Domain type changed ",
      error: error.message,
    };
  }
}
module.exports = {
  adddomain,
  domainlist,
  deletedomain,
  changedomaintype,
  changerenewstatus,
  changesubscriptionstatus
}