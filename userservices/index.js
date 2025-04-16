/* Using ExpressJS frameword to create a simple REST API using micro services method */
const express = require("express"); // Import the Express module
const app = express();
const PORT = 7001; // Set the port number for the server
var cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
require("dotenv").config();
// Import routes
const userRoute = require('./routes/userroute');
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

app.get("/userservices", postLogger, (req, res) => {
  res.send("We are calling users services API");
});

app.get("/userservices/test", postLogger, (req, res) => {
  res.send("We Are Calling User Test API");
});

app.use('/userservices/user/api/v1', postLogger, userRoute);

     

// Swagger UI
app.use("/userservices/api-docs", postLogger, swaggerUi.serve, swaggerUi.setup(swaggerSpec));




// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log("Calling User Services on PORT "+PORT);
});
