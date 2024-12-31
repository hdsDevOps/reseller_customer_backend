const { admin, db } = require("../firebaseConfig");

const getCustomerSubscription = async (data) => {
  try {
    if (!data.customer_id) {
      return { status: 400, message: "Missing required fields customer Id" };
    }
    const subscriptionRef = db.collection("customer_subscriptions");
    let query = subscriptionRef.where("customer_id", "==", data.customer_id);
    if (data.domain_name) {
      query = query.where("domain", "array-contains", data.domain_name);
    }
    if (data.hasOwnProperty('start_date') && data.hasOwnProperty('end_date') && data.start_date != "" && data.end_date != "") {
      let start_date = new Date(data.start_date);
      let end_date = new Date(data.end_date);
      query = query.where("last_payment", ">=", start_date).where("last_payment", "<=", end_date);
    }

    let snapshot = await query.get();
    if (snapshot.empty) {
      return { status: 200, message: "No subscription found for the customer" };
    }
    const subscriptions = [];
    snapshot.forEach(doc => {
      const subscription = doc.data();
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

    if (!data.product_type || !data.payment_cycle || !data.customer_id || !data.description || !data.last_payment || !data.next_payment || !data.payment_method || !data.subscription_status) {
      return { status: 400, message: "Missing required fields" };
    }
    

    const newSubscription = {
      product_type: data.product_type,
      payment_cycle: data.payment_cycle,
      customer_id: data.customer_id,
      description: data.description,
      domain: data.domain,
      last_payment: new Date(data.last_payment),
      next_payment: new Date(data.next_payment),
      payment_method: data.payment_method,
      subscription_status: data.subscription_status
    };
    const docRef = await admin
      .firestore()
      .collection("customer_subscriptions")
      .add(newSubscription);
    return { status: 200, message: "Customer subscription added successfully" };
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
    if (data.hasOwnProperty('payment_method')) {
      updateValue.payment_method = data.payment_method;
    }
    if (data.hasOwnProperty('subscription_status')) {
      updateValue.subscription_status = data.subscription_status;
    }
    if (data.hasOwnProperty('payment_cycle')) {
      updateValue.payment_cycle = data.payment_cycle;
    }


    const subscriptionRef = db.collection("customer_subscriptions").doc(data.subscription_id);
    const subscriptionDoc = await subscriptionRef.get();
    const subscription = subscriptionDoc.data();
    await subscriptionRef.update({ ...subscription, ...updateValue });

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


module.exports = {
  getCustomerSubscription,
  addCustomerSubscription,
  updateCustomerSubscription
};