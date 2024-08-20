const swaggerJsDoc = require('swagger-jsdoc');


const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Customer Services API",
            description: "Customer Services API Documentation",
        },
        servers: [{url: "http://localhost:7002"}]
    },
    apis: ["./routes/*.js", "./schemas/*.js"]
}

const swaggerDocs = swaggerJsDoc(swaggerOptions)


module.exports = swaggerDocs