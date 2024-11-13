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

require('dotenv').config();
  
  
app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Routes
app.get("/", (req, res) => {
  res.redirect("/api-docs");
});

app.get("/paymentservices", (req, res) => {
  res.send("We are calling Payment users API");
});

app.get("/paymentservices/test", (req, res) => {
  res.send("We Are Calling User Test API");
});

app.use('/paymentservices/payment/api/v1', homeRoute);

// Swagger UI
app.use("/paymentservices/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));




// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log("Calling Payment Services on port " + PORT);
});
