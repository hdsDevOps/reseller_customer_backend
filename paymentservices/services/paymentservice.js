const { describe } = require("node:test");
const { admin, db } = require("../firebaseConfig");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const { v4: uuidv4 } = require('uuid');
const Paystack = require('paystack');
const https = require('https')
const axios = require('axios');


async function makeStripePayment(data) {
  const idempotencyKey = uuidv4();
  const { product, token } = data;

  try {

    /*
      get own customer details by collection id
    */
    let domain_amount = 0;
    let workspace_amount = 0;
    let total_price = 0;
    let domain_details = "";
    let discount = 0;//in percent
    let tax = 8.25;
    const ownCustomer = await customerDetails(product.customer_id);

    if (product.hasOwnProperty('domain') && product.domain != "" && product.domain != null) {
      domain_details = await fetchDomainData(product.domain.domain_name)
      if (product.domain.type == "new") {
        domain_amount = domain_details.price[product.currency] * product.domain.year
      } else {
        domain_amount = domain_details.renewal[product.currency] * product.domain.year
      }
    }

    if (product.hasOwnProperty('workspace') && product.workspace != "" && product.workspace != null && product.workspace.plan != "") {
      if (product.workspace.trial_plan !== "yes") {
        const subscription_details = await subscriptionDetails(product.workspace.plan.id)
        let subs_amount = subscription_details.subsccription.amount_details;
        if (subs_amount != "") {
          for (const subAmount of subs_amount)
            if (subAmount.currency_code == product.currency) {
              for (const subPrice of subAmount.price)
                if (subPrice.type == product.workspace.plan_period) {
                  workspace_amount = subPrice.discount_price * product.workspace.license_usage
                }
            }
        }
      }
    }

    if (product.hasOwnProperty('voucher_id') && product.voucher_id != "" && product.voucher_id != null) {
      voucherData = await getVoucherDetails(product.voucher_id);
      if (new Date() >= voucherData.start_date && new Date() <= voucherData.end_date && is_deleted == 0) {
        discount = voucherData.discount_rate;
      }
    }

    let net_price = 0;
    let gross_price = 0;
    if (discount > 0) {
      net_price = (workspace_amount + domain_amount);
      gross_price = (net_price) + (net_price * tax / 100);
      total_price = (((gross_price) - (gross_price * discount / 100))).toFixed(2);
    } else {
      net_price = (workspace_amount + domain_amount);
      total_price = ((net_price) + (net_price * tax / 100)).toFixed(2);
    }

    // Create a new customer 
    const customer = await stripe.customers.create({ email: token.email, source: token.id });
    // Create a charge 
    const charge = await stripe.charges.create({
      amount: parseInt(total_price * 100),    // Stripe expects the amount in cents 
      currency: product.currency,
      customer: customer.id,
      receipt_email: token.email,
      description: product.description
    }, { idempotencyKey });
    return { status: 200, message: "Payment successful", charge };
  } catch (error) {
    console.error("Error in makeStripePayment:", error);
    return { status: 500, message: "Error during payment", error: error.message };
  }
}



async function makePaystackPayment(data) {
  const { product, token } = data;

  try {
    let domain_amount = 0;
    let workspace_amount = 0;
    let total_price = 0;
    let domain_details = "";
    let discount = 0;//in percent
    let tax = 8.25;
    const ownCustomer = await customerDetails(product.customer_id);

    if (product.hasOwnProperty('domain') && product.domain != "" && product.domain != null) {
      domain_details = await fetchDomainData(product.domain.domain_name)
      if (product.domain.type == "new") {
        domain_amount = domain_details.price[product.currency] * product.domain.year
      } else {
        domain_amount = domain_details.renewal[product.currency] * product.domain.year
      }
    }

    if (product.hasOwnProperty('workspace') && product.workspace != "" && product.workspace != null && product.workspace.plan != "") {
      if (product.workspace.trial_plan !== "yes") {
        const subscription_details = await subscriptionDetails(product.workspace.plan.id)
        let subs_amount = subscription_details.subsccription.amount_details;
        if (subs_amount != "") {
          for (const subAmount of subs_amount)
            if (subAmount.currency_code == product.currency) {
              for (const subPrice of subAmount.price)
                if (subPrice.type == product.workspace.plan_period) {
                  workspace_amount = subPrice.discount_price * product.workspace.license_usage
                }
            }

        }
      }
    }
    if (product.hasOwnProperty('voucher_id') && product.voucher_id != "" && product.voucher_id != null) {
      voucherData = await getVoucherDetails(product.voucher_id);
      if (new Date() >= voucherData.start_date && new Date() <= voucherData.end_date && is_deleted == 0) {
        discount = voucherData.discount_rate;
      }
    }

    let net_price = 0;
    let gross_price = 0;
    if (discount > 0) {
      net_price = (workspace_amount + domain_amount);
      gross_price = (net_price) + (net_price * tax / 100);
      total_price = (((gross_price) - (gross_price * discount / 100))).toFixed(2);
    } else {
      net_price = (workspace_amount + domain_amount);
      total_price = ((net_price) + (net_price * tax / 100)).toFixed(2);
    }

    const params = JSON.stringify({
      "email": ownCustomer.email,
      "amount": parseInt(total_price * 100)    // Stripe expects the amount in cents 
    })
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        'Content-Type': 'application/json'
      }
    }

    const data1 = await new Promise((resolve, reject) => {
      const req = https.request(options, response => {
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      });
      req.on('error', reject);
      req.write(params);
      req.end();
    });
    // Send the response back to the route 
    return data1;

  } catch (error) {
    console.error("Error while making Paystack payment:", error);
    return { status: 500, error: error.message };
  }
}

async function customerDetails(customer_id) {

  try {
    if (!customer_id) {
      return { status: 400, message: "Missing customer ID" };
    }

    const customerDoc = await db.collection("customers").doc(customer_id).get();

    if (!customerDoc.exists) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const customer = customerDoc.data() || [];

    return { status: 200, customer };
  } catch (error) {
    console.error("Error in customerDetails:", error);
    return {
      status: 500,
      message: "Error fetching customer",
      error: error.message,
    };
  }
}
async function fetchDomainData(domain_name) {
  try {
    const queryParams = { domain_name: domain_name };
    const response = await axios.get(process.env.DOMAIN_API, { params: queryParams });
    return response.data.available.domain;
  } catch (error) {
    return {
      status: 500,
      message: "Error fetching customer",
      error: error.message,
    };
  }
}
async function subscriptionDetails(subscription_id) {

  try {
    if (!subscription_id) {
      return { status: 400, message: "Missing subscription ID" };
    }

    const subscriptionDoc = await db.collection("subscription_plans").doc(subscription_id).get();

    if (!subscriptionDoc.exists) {
      return res.status(404).json({ error: "subscription not found" });
    }

    const subsccription = subscriptionDoc.data() || [];

    return { status: 200, subsccription };
  } catch (error) {
    console.error("Error in subscriptionDetails:", error);
    return {
      status: 500,
      message: "Error fetching subscription",
      error: error.message,
    };
  }
}
async function getVoucherDetails(voucher_id) {

  try {
    if (!voucher_id) {
      return { status: 400, message: "Missing voucher ID" };
    }

    const voucherDoc = await db.collection("vouchers").doc(voucher_id).get();
    const voucher = voucherDoc.data() || [];

    return { status: 200, voucher };
  } catch (error) {
    console.error("Error in getVoucherDetails:", error);
    return {
      status: 500,
      message: "Error fetching voucher",
      error: error.message,
    };
  }
}

module.exports = {
  makeStripePayment,
  makePaystackPayment
}