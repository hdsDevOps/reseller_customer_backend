const { admin, db } = require("../firebaseConfig");
const { v4: uuidv4 } = require('uuid');

const getCustomerSubscription = async (data) => {
  try {
    if (!data.customer_id) {
      return { status: 400, message: "Missing required fields customer Id" };
    }
    const subscriptionRef = db.collection("customer_subscriptions");
    let query = subscriptionRef.where("customer_id", "==", data.customer_id);
    if (data.hasOwnProperty('domain_name') && data.domain_name != "" && data.domain_name != undefined) {
      query = query.where("domain", "array-contains", data.domain_name);
    }
    if (data.hasOwnProperty('start_date') && data.hasOwnProperty('end_date') && data.start_date != "" && data.end_date != "") {
      let start_date = new Date(data.start_date.getFullYear(), data.start_date.getMonth(), data.start_date.getDate(), 0, 0, 0, 0);
      let end_date = new Date(data.end_date.getFullYear(), data.end_date.getMonth(), data.end_date.getDate(), 23, 59, 59, 999);
      query = query.where("last_payment", ">=", start_date).where("last_payment", "<=", end_date);
    }

    let snapshot = await query.get();
    if (snapshot.empty) {
      return { status: 200, message: "No subscription found for the customer" };
    }
    const subscriptions = [];
    snapshot.forEach(doc => {
      const subscription = doc.data();
      subscription.id = doc.id;
      subscriptions.push(subscription);
    });
    return { status: 200, message: "Customer subscription fetched successfully", subscriptions };
  } catch (error) {
    console.error("Error in getCustomerSubscription:", error);
    return {
      status: 500,
      message: "Error fetching customer subscription",
      error: error.message
    };
  }
}
const addCustomerSubscription = async (data) => {
  try {
    if (!data.product_type || !data.payment_cycle || !data.customer_id || !data.description || !data.last_payment || !data.next_payment || !data.payment_method || !data.subscription_status || !data.license_usage) {
      return { status: 400, message: "Missing required fields" };
    }

    if (data.payment_details.length > 0) {
      data.payment_details.forEach(element => {
        element.uuid = uuidv4().replace(/-/g, '');
      });
    } else {
      data.payment_details = [];
    }

    // Using plain objects instead of arrays for newSubscription, subs, and trial
    let newSubscription = {};
    let subs = {};
    let trial = {};
    let docRef = {};

    if (data.hasOwnProperty('domain') && data.domain.length > 0) {

      // Use Promise.all to handle async operations inside forEach
      const domainChecks = data.domain.map(async element => {
        element = element != "" && element != null ? element.toLowerCase() : "";

        const cusDocref = db.collection("customer_subscriptions")
          .where("domain", "array-contains", element)
          .where("customer_id", "==", data.customer_id)
          .where("last_payment", "==", new Date(data.last_payment))
          .where("next_payment", "==", new Date(data.next_payment));

        const cusDocSnapshot = await cusDocref.get();

        if (!cusDocSnapshot.empty) {
          return { status: 400, message: "Duplicate entry found for the domain" };
          // throw new Error("Duplicate entry found for the domain");
        }
      });

      await Promise.all(domainChecks);
    }

    if (data.hasOwnProperty('plan_name_id') && data.plan_name_id != "" && data.plan_name_id != undefined) {
      const cusDocref = db.collection("customer_subscriptions").where("plan_name_id", "==", data.plan_name_id).where("customer_id", "==", data.customer_id).where("last_payment", "==", new Date(data.last_payment)).where("next_payment", "==", new Date(data.next_payment));
      const cusDocSnapshot = await cusDocref.get();
      if (!cusDocSnapshot.empty) {
        return { status: 200, message: "Duplicate entry found for the subscription" };
      }

    }

    newSubscription.product_type = data.product_type;
    subs.payment_cycle = newSubscription.payment_cycle = data.payment_cycle;
    newSubscription.customer_id = data.customer_id;
    newSubscription.description = data.description;
    newSubscription.domain = data.domain;
    newSubscription.payment_details = admin.firestore.FieldValue.arrayUnion(...data.payment_details);
    subs.plan_name_id = newSubscription.plan_name_id = data.plan_name_id;
    subs.last_payment = newSubscription.last_payment = new Date(data.last_payment);
    subs.next_payment = newSubscription.next_payment = new Date(data.next_payment);
    newSubscription.payment_method = data.payment_method;
    subs.subscription_status = newSubscription.subscription_status = data.subscription_status;
    subs.subscription_date = newSubscription.subscription_date = new Date();
    // subs.license_usage  = data.license_usage;

    if (data.hasOwnProperty('plan_name_id')) {
      subs.plan_name_id = data.plan_name_id;
    }
    if (data.hasOwnProperty('is_trial')) {
      trial.is_trial = data.is_trial;
    }
    if (data.hasOwnProperty('workspace_status')) {
      subs.workspace_status = data.workspace_status;
    }

    if (data.product_type == "google workspace") {
      const cusDocref = db.collection("customer_subscriptions").where("product_type", "==", "google workspace").where("customer_id", "==", data.customer_id);
      const cusDocSnapshot = await cusDocref.get();
      if (cusDocSnapshot.empty) {
        docRef = await admin.firestore().collection("customer_subscriptions").add(newSubscription);
      } else {
        cusDocSnapshot.forEach(async (doc) => {
          const cusDoc = doc.data();
          docRef = db.collection("customer_subscriptions").doc(doc.id);
          await docRef.update({ ...cusDoc, ...newSubscription });
        });
      }
    } else {
      const cusDocref = db.collection("customer_subscriptions").where("domain", "array-contains", data.domain).where("customer_id", "==", data.customer_id);
      const cusDocSnapshot = await cusDocref.get();
      if (cusDocSnapshot.empty) {
        docRef = await admin.firestore().collection("customer_subscriptions").add(newSubscription);
      } else {
        cusDocSnapshot.forEach(async (doc) => {
          const cusDoc = doc.data();
          docRef = db.collection("customer_subscriptions").doc(doc.id);
          await docRef.update({ ...cusDoc, ...newSubscription });
        });
      }
    }





    const workspaceRef = admin.firestore().collection("customers").doc(data.customer_id);
    if (data.hasOwnProperty('product_type') && data.product_type == "google workspace") {
      if (data.hasOwnProperty('license_usage') && (data.license_usage != "" || data.license_usage != null)) {
        await workspaceRef.update({ workspace: subs, ...trial, 'license_usage': data.license_usage });
      } else {
        await workspaceRef.update({ workspace: subs, ...trial });
      }
    } else {
      await workspaceRef.update({ domain_details: subs });
    }

    return { status: 200, message: "Customer subscription added successfully", subscription_id: docRef.id };
  } catch (error) {
    console.error("Error in addCustomerSubscription:", error);
    return {
      status: 500,
      message: "Error adding customer subscription",
      error: error.message
    };
  }

}

const updateCustomerSubscription = async (data) => {
  try {
    if (!data.subscription_id) {
      return { status: 400, message: "Missing required fields" };
    }

    const updateValue = {};
    let workspace = {};
    let trial = {};


    if (data.hasOwnProperty('subscription_status')) {
      workspace.subscription_status = updateValue.subscription_status = data.subscription_status;
    }
    if (data.hasOwnProperty('payment_cycle')) {
      workspace.payment_cycle = updateValue.payment_cycle = data.payment_cycle;
    }
    if (data.hasOwnProperty('last_payment')) {
      workspace.last_payment = updateValue.last_payment = new Date(data.last_payment);
    }
    if (data.hasOwnProperty('next_payment')) {
      workspace.next_payment = updateValue.next_payment = new Date(data.next_payment);
    }



    if (data.hasOwnProperty('plan_name_id')) {
      workspace.plan_name_id = data.plan_name_id;
    }
    if (data.hasOwnProperty('is_trial')) {
      trial.is_trial = data.is_trial;
    }
    if (data.hasOwnProperty('workspace_status')) {
      workspace.workspace_status = data.workspace_status;
    }


    if (data.hasOwnProperty('payment_method')) {
      updateValue.payment_method = data.payment_method;
    }
    if (data.hasOwnProperty('subscription_status')) {
      updateValue.subscription_status = data.subscription_status;
    }
    if (data.hasOwnProperty('plan_name_id')) {
      updateValue.plan_name_id = data.plan_name_id;
    }
    if (data.hasOwnProperty('payment_details') && data.payment_details.length > 0) {

      if (data.payment_details.length > 0) {
        data.payment_details.forEach(element => {
          element.uuid = uuidv4().replace(/-/g, '');
        });
      } else {
        data.payment_details = [];
      }
      updateValue.payment_details = admin.firestore.FieldValue.arrayUnion(...data.payment_details);
    }
    if (data.hasOwnProperty('reason')) {
      workspace.reason = updateValue.reason = data.reason;
    }
    // updateValue.subscription_date = new Date();

    const subscriptionRef = db.collection("customer_subscriptions").doc(data.subscription_id);
    const subscriptionDoc = await subscriptionRef.get();
    const subscription = subscriptionDoc.data();
    await subscriptionRef.update({ ...subscription, ...updateValue });

    if (data.hasOwnProperty('product_type') && data.product_type == "google workspace") {

      const workspaceRef = admin.firestore().collection("customers").doc(data.customer_id);
      await workspaceRef.update({ workspace, ...trial });
    }
    if (data.hasOwnProperty('license_usage') && data.license_usage != "" && data.license_usage != null) {
      const workspaceRef = db.collection("customers").doc(data.customer_id);
      await workspaceRef.update({ "license_usage": data.license_usage });
    }

    return { status: 200, message: "Customer subscription updated successfully", subscription_id: data.subscription_id };

  } catch (error) {
    console.error("Error in updateCustomerSubscription:", error);
    return {
      status: 500,
      message: "Error updating customer subscription",
      error: error.message
    };
  }
}

const changeAutoRenewalStatus = async (data) => {
  try {
    if (!data.subscription_id) {
      return { status: 400, message: "Missing required fields" };
    }
    let workspace = {};

    if (data.hasOwnProperty('status')) {
      workspace = data.status;
    }

    const subscriptionRef = db.collection("customer_subscriptions").doc(data.subscription_id);
    const subscriptionDoc = await subscriptionRef.get();
    const subscription = subscriptionDoc.data();
    await subscriptionRef.update({ ...subscription, subscription_status: workspace });

    if (data.hasOwnProperty('product_type') && data.product_type == "google workspace") {

      const workspaceRef = admin.firestore().collection("customers").doc(subscription.customer_id);
      const workspaceSnap = await workspaceRef.get();
      const workspaceDoc = workspaceSnap.data();
      await workspaceRef.update({ "workspace.subscription_status": workspace });
    }

    return { status: 200, message: "Customer subscription status updated successfully", subscription_id: data.subscription_id };

  } catch (error) {
    console.error("Error in changeAutoRenewalStatus:", error);
    return {
      status: 500,
      message: "Error updating customer subscription",
      error: error.message
    };
  }
}

const updateLicenseUsage = async (data) => {
  try {
    if (!data.user_id) {
      return { status: 400, message: "Missing required fields" };
    }


    const customerRef = db.collection("customers").doc(data.user_id);
    const customerDoc = await customerRef.get();
    const customers = customerDoc.data();
    await customerRef.update({ "license_usage": data.license_usage });


    return { status: 200, message: "Customer subscription license usage updated successfully" };

  } catch (error) {
    console.error("Error in updateLicenseUsage:", error);
    return {
      status: 500,
      message: "Error updating customer subscription license usage",
      error: error.message
    };
  }
}

module.exports = {
  getCustomerSubscription,
  addCustomerSubscription,
  updateCustomerSubscription,
  changeAutoRenewalStatus,
  updateLicenseUsage
};