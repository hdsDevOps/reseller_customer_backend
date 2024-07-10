/* Using ExpressJS frameword to create a simple REST API using micro services method */
const express = require("express"); // Import the Express module
const app = express();
const PORT = 8007; // Set the port number for the server

app.get('/subscriptionservices',(req,res)=>{
    res.send("We are calling subscription API");
})

app.get('/subscriptionservices/test',(req,res)=>{
    res.send("We Are Calling User Test API");
})
// Start the server and listen on the specified port
app.listen(PORT,()=>{
    console.log("Calling subscription Services");
})