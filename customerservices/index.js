/* Using ExpressJS frameword to create a simple REST API using micro services method */
const express = require("express"); // Import the Express module
const app = express();
const PORT = 7002; // Set the port number for the server
var cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
require("dotenv").config();
// Import routes 
const adminCredentialsRoute = require("./routes/loginroute.js");
const customerRoute = require('./routes/customerroute');
const homeRoute = require('./routes/homeroute');
const userRoute = require('./routes/userroute');
const settingRoute = require('./routes/settingroute');
const domainroute = require('./routes/domainroute');
const postLogger = require("./middleware/postLogger.js");

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

app.get("/customerservices", postLogger, (req, res) => {
  res.send("We are calling customer users API");
});

app.get("/customerservices/test", postLogger, (req, res) => {
  res.send("We Are Calling User Test API CUSTOMER..");
});

app.use('/customerservices/customer', postLogger, adminCredentialsRoute);
app.use('/customerservices/customer/api/v1', postLogger, customerRoute);
app.use('/customerservices/home/api/v1', postLogger, homeRoute);
app.use('/customerservices/user/api/v1', postLogger, userRoute);
app.use('/customerservices/setting/api/v1', postLogger, settingRoute);
app.use('/customerservices/domain/api/v1', postLogger, domainroute);


// Swagger UI
app.use("/customerservices/api-docs", postLogger, swaggerUi.serve, swaggerUi.setup(swaggerSpec));



// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log("Calling customer Services PORT : ", PORT);
});
