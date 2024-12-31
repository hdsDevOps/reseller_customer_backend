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
    const customervouchersSnapshot = await db.collection("customer_vouchers").where("customer_id", "==", data.customer_id).get();
    const vouchersSnapshot = await db.collection("vouchers").get();

    const customers = customervouchersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const vouchers = vouchersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const joinedData = customers.map(cust => { return { ...cust, voucher: vouchers.find(vou => vou.id === cust.voucher_id) }; });


    return { status: 200, message: "customer voucher list fatched successfully", joinedData };
  } catch (error) {
    console.error("Error in getVoucherList:", error);
    return { status: 500, message: "Error fetching vouchers", error: error.message };
  }
}
module.exports = {
  getVoucherList,
  getCustomerVoucherList
};