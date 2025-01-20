const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentservice');



router.post("/make_stripe_payment",async (req,res)=>{
   try {
      const result = await paymentService.makeStripePayment(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ status: 500, message: "Error doing payment", error: error.message });
    }
})
router.post("/make_paystack_payment",async (req,res)=>{
  //  try {
      const result = await paymentService.makePaystackPayment(req.body);
      console.log(result)
      res.json(result);
    // } catch (error) {
    //   res.status(500).json({ status: 500, message: "Error doing payment", error: error.message });
    // }
})
module.exports = router;