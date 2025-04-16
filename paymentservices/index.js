/* Using ExpressJS frameword to create a simple REST API using micro services method */
const express = require("express"); // Import the Express module
const app = express();
const PORT = 7003; // Set the port number for the server
var cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
require("dotenv").config();
// Import routes
   
const homeRoute = require('./routes/homeroute');
const paymentroute = require('./routes/payment');
const postLogger = require("./middleware/postLogger");

require('dotenv').config();
  
    
app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Routes
app.get("/", postLogger, (req, res) => {
  res.redirect("/api-docs");
});

app.get("/paymentservices", postLogger, (req, res) => {
  res.send("We are calling Payment users API");
}); 

app.get("/paymentservices/test", postLogger, (req, res) => {
  res.send("We Are Calling User Test API");
});

app.use('/paymentservices/payment/api/v1', postLogger, homeRoute);
app.use('/paymentservices/payments/api/v1', postLogger, paymentroute);

// Swagger UI
app.use("/paymentservices/api-docs", postLogger, swaggerUi.serve, swaggerUi.setup(swaggerSpec));




// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log("Calling Payment Services on port " + PORT);
});
