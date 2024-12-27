const { admin, db } = require("../firebaseConfig");

const addCustomerSubscription = async (data) => {
  try {
    console.log("object===============",data);
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




module.exports = {
  addCustomerSubscription
};