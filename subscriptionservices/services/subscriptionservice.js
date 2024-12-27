const { admin, db } = require("../firebaseConfig");

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
      last_payment: data.last_payment,
      next_payment: data.next_payment,
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
  addCustomerSubscription,
  updateCustomerSubscription
};