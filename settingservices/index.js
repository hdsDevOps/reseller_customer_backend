/* Using ExpressJS frameword to create a simple REST API using micro services method */
const express = require("express"); // Import the Express module
const app = express();
const PORT = 7004; // Set the port number for the server
var cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
require("dotenv").config();
// Import routes
const settingRoute = require('./routes/settingroute');
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

app.get("/settingservices", (req, res) => {
  res.send("We are calling customer users API");
});

app.get("/settingservices/test", (req, res) => {
  res.send("We Are Calling Settings Test API");
});

app.use('/settingservices/setting/api/v1', settingRoute);


// Swagger UI
app.use("/settingservices/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));




// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log("Calling Setting Services on port " + PORT);
});
