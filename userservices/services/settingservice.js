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

  module.exports = {
    getVoucherList,
  };