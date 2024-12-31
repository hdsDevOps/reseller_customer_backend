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
async function getCustomerVoucherList(data) {
  try {
    if (!data.customer_id) {
      return { status: 400, message: "Missing required fields" };
    }
    const vouchersSnapshot = await db.collection("customer_vouchers").where("customer_id", "==", data.customer_id).get();
    const vouchers = vouchersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { status: 200, message: "customer voucher list fatched successfully", vouchers };
  } catch (error) {
    console.error("Error in getVoucherList:", error);
    return { status: 500, message: "Error fetching vouchers", error: error.message };
  }
}
module.exports = {
  getVoucherList,
  getCustomerVoucherList
};