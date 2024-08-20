/* Using ExpressJS frameword to create a simple REST API using micro services method */
const express = require("express"); // Import the Express module
const app = express();
const PORT = 7002; // Set the port number for the server
const cors = require('cors');
const swaggerUi = require('swagger-ui-express')
const swaggerDocs = require('./swaggerConfig')
const registerUser = require("./routes/registerroute")


app.use(cors());
app.use(express.json());
app.use(
    express.urlencoded({
      extended: true,
    })
  );
app.use('/docs',swaggerUi.serve,swaggerUi.setup(swaggerDocs));

app.get('docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerDocs)
})
app.get('/customerservices',(req,res)=>{
    res.send("We are calling customer users API");
})

app.get('/', (req,res) => {
  res.redirect('/docs')
})

app.get('/customerservices/test',(req,res)=>{
    res.send("We Are Calling User Test API");
})

app.use('/customer',registerUser);
// Start the server and listen on the specified port
app.listen(PORT,()=>{
    console.log("Calling customer Services");
    console.log(`INFO: Docs available at http://localhost:${PORT}/docs`);
    
    
})