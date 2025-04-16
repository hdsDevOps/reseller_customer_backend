/* Using ExpressJS frameword to create a simple REST API using micro services method */
const express = require("express"); // Import the Express module
const postLogger = require("./middleware/postLogger");
const app = express();
const PORT = 7005; // Set the port number for the server
  
app.get('/notificationservices', postLogger, (req,res)=>{
    res.send("We are calling notification services API");
})
  
app.get('/notificationservices/test', postLogger, (req,res)=>{
    res.send("We Are Calling User Test API");
})
// Start the server and listen on the specified port
app.listen(PORT,()=>{
    console.log("Calling notification Services");
})