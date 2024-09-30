// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Customer Services API',
      version: '1.0.0',
      description: 'API documentation for Customer Services',
    },
    servers: [
      {
        url: 'http://localhost:7002',
        description: 'Development server',
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to the API routes
};

module.exports = swaggerJsdoc(options);