const { describe } = require("node:test");
const { admin, db } = require("../firebaseConfig");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const { v4: uuidv4 } = require('uuid');


async function makeStripePayment(data) {
  const { product, token } = data; const idempotencyKey = uuidv4();
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



module.exports = {
  makeStripePayment
}