/* Using ExpressJS frameword to create a simple REST API using micro services method */
const express = require("express"); // Import the Express module
const app = express();
const PORT = 7007; // Set the port number for the server
var cors = require("cors");
require("dotenv").config();
// Import routes 
const subscriptionroute = require("./routes/subscriptionroute.js");
const postLogger = require("./middleware/postLogger.js");
    

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);



app.get('/subscriptionservices', postLogger, (req,res)=>{
    res.send("We are calling subscription API");
})
    
app.get('/subscriptionservices/test', postLogger, (req,res)=>{
    res.send("We Are Calling User Test API");
})

app.use('/subscriptionservices/subscription/api/v1', postLogger, subscriptionroute);



// Start the server and listen on the specified port
app.listen(PORT,()=>{
    console.log(`Calling subscription Services ${PORT}`);
})