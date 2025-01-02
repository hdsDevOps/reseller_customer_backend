const { db } = require("../firebaseConfig");

async function getVoucherList() {
  try {
    const vouchersSnapshot = await db.collection("vouchers").get();
    const vouchers = vouchersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { status: 200, vouchers };
  } catch (error) {
    console.error("Error in getVoucherList:", error);
    return { status: 500, message: "Error fetching vouchers", error: error.message };
  }
}
async function defaultPaymentMethod(data) {
  try {
    if (!data.user_id) {
      return { status: 400, message: "Missing field user ID" };
    }
    const paymentRef = await db.collection("payment_methods").where("status", "==", "ACTIVE").get();
    const customerRef = await db.collection("customers").doc(data.user_id).get();
    const customerdoc = customerRef.data();
    const methodID = customerdoc.payment_method_id;

    const paymentMethods = paymentRef.docs.map(doc => {
      const isDefault = methodID === doc.id;
      return {
        id: doc.id, ...doc.data(), default: isDefault
      }

    });


    return { status: 200, message: "payment method fetched successfully", paymentMethods };

  } catch (error) {
    console.error("Error in defaultPaymentMethod:", error);
    return { status: 500, message: "Error getting default payment method", error: error.message };
  }

}

module.exports = {
  getVoucherList,
  defaultPaymentMethod
};