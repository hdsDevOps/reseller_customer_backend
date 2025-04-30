// middleware/postLogger.js
const fs = require('fs');
const { db } = require('../firebaseConfig');

function postLogger(req, res, next) {
  const startTime = Date.now();
  let responseBody;

  // Save a reference to the original res.send.
  const originalSend = res.send;
  
  // Override res.send to capture the response body.
  res.send = function (body) {
    responseBody = body;
    return originalSend.call(this, body);
  };

  res.on('finish', async () => {
    const elapsedTime = Date.now() - startTime;
    let logMessage = '';

    try {
      // Parse the response payload if it's a string.
      const parsedData =
        typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;

      // Check for top-level message first
      if (parsedData && parsedData.message) {
        logMessage = parsedData.message;
      }
      // If not available, check if parsedData.data.message exists.
      else if (parsedData && parsedData.data && parsedData.data.message) {
        logMessage = parsedData.data.message;
      }
      // Otherwise check for an error property.
      else if (parsedData && parsedData.error) {
        logMessage = parsedData.error;
      }
    } catch (e) {
      // If parsing fails, use a default message.
      logMessage = 'Could not parse response body';
    }

    const finalLog = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} finished in ${elapsedTime}ms with status ${res.statusCode}. Message: ${logMessage || 'None'}`;
    
    // Log to console.
    // console.log(finalLog);

    // Save the log message to a file if the response indicates an error.
    // fs.appendFile('error.log', finalLog + '\n', (err) => {
    //   if (err) console.error('Error writing to log file:', err);
    // });

    await db.collection("api_logs").add({
      url: req.originalUrl,
      message: logMessage,
      at_time: new Date().toISOString(),
      method: req.method,
      elapsed_time: elapsedTime,
    });
  });

  next();
}

module.exports = postLogger;
