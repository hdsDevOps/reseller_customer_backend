const express = require('express');  // Import the Express module
const { createProxyMiddleware } = require('http-proxy-middleware');  // Import the http-proxy-middleware module
const PORT = 7000;  // Set the port number for the server
var cors = require('cors');
const app = express();
   
// CORS setup
app.use(cors({
    origin: '*',  // Dynamic CORS setup
    methods: 'GET, POST',
    credentials: true,  // Allow cookies and authentication headers
}));
             
// Define the routes for the microservices
const routes = {
    '/userservices': "https://userapi.customer.gworkspace.withhordanso.com",
    '/customerservices': "https://customerapi.customer.gworkspace.withhordanso.com",
    '/paymentservices': "https://paymentapi.customer.gworkspace.withhordanso.com",
    '/settingservices': "https://settingapi.customer.gworkspace.withhordanso.com",
    '/notificationservices': "https://notificationapi.customer.gworkspace.withhordanso.com",
    '/reportservices': "https://reportapi.customer.gworkspace.withhordanso.com",
    '/subscriptionservices': "https://subscriptionapi.customer.gworkspace.withhordanso.com",
    '/voucherservices': "https://voucherapi.customer.gworkspace.withhordanso.com",
    '/googleservices': "https://googleapi.customer.gworkspace.withhordanso.com",
};

// Proxy setup for each route
for (const route in routes) {
    const target = routes[route];
    app.use(route, createProxyMiddleware({
        target,
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',  // Enable debug logging
        onProxyReq: (proxyReq, req, res) => {
            console.log(`Proxying request: ${req.method} ${req.url} to ${target}`);
        },
        onProxyRes: (proxyRes, req, res) => {
            console.log(`Response from ${target}: ${proxyRes.statusCode}`);
        },
    }));
}

// Middleware to log all requests
app.use(function (req, res, next) {
    console.log("Middleware called");
    next();
});

// Sample test route
app.get('/Test', function (req, res) {
    res.json({ message: 'Welcome to hordanso microservices API gateway TEST' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);  // Log the error
    res.status(500).json({ message: 'Internal Server Error' });
});

// Start the server
app.listen(PORT, () => {
    console.log("API GATEWAY SERVICE RUNNING ON PORT " + PORT);
});
