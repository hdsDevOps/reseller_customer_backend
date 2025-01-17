const { describe } = require("node:test");
const { admin, db } = require("../firebaseConfig");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const { v4: uuidv4 } = require('uuid');
const Paystack = require('paystack');
const https = require('https')


async function makeStripePayment(data) {
  const { product, token } = data; 
  const idempotencyKey = uuidv4();
  try {
    // Create a new customer 
    const customer = await stripe.customers.create({ email: token.email, source: token.id });
    // Create a charge 
    const charge = await stripe.charges.create({
      amount: product.price * 100,    // Stripe expects the amount in cents 
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

// async function makePaystackPayment(data) {
//   const { email, amount } = data;
//   try {
//     const result = await Paystack.transaction.initialize({
//       email, amount: amount * 100 // Paystack expects amount in kobo
//     });
//     return { status: 200, data: result };
//   } catch (error) {
//     console.error("Error while making Paystack payment:", error);
//     return { status: 500, error: error.message };
//   }
// }
async function makePaystackPayment(data) {
  const { email, amount } = data;
  try {
    const params = JSON.stringify({
      "email": email,
      "amount": amount*100
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

    const req = https.request(options, res => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      });

      res.on('end', () => {
        console.log(JSON.parse(data))
      })
    }).on('error', error => {
      console.error(error)
    })

    req.write(params)
    req.end()
  } catch (error) {
    console.error("Error while making Paystack payment:", error);
    return { status: 500, error: error.message };
  }
}


module.exports = {
  makeStripePayment,
  makePaystackPayment
}