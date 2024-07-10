/* Using ExpressJS frameword to create a simple REST API using micro services method */
const express = require("express"); // Import the Express module
const app = express();
const PORT = 8002; // Set the port number for the server
var cors = require('cors');
app.use(cors());
const adminCredentialsRoute  = require('./routes/loginroute.js');
app.use(express.json());
app.use(
    express.urlencoded({
      extended: true,
    })
  );
app.get('/customerservices',(req,res)=>{
    res.send("We are calling customer users API");
})

app.get('/customerservices/test',(req,res)=>{
    res.send("We Are Calling User Test API");
})

app.use('/customer',adminCredentialsRoute);
// Start the server and listen on the specified port
app.listen(PORT,()=>{
    console.log("Calling customer Services");
})