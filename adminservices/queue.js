// queue.js
const Queue = require('bull');
const helper = require('./helper');

const emailQueue = new Queue('emailQueue');

// Process the queue
emailQueue.process(async (job) => {
    const { to, subject, text } = job.data;
    console.log(job.data);
    await helper.sendMail(to, subject, text);
});

// Add a new email job to the queue
const addEmailToQueue = (to, subject, text) => {
    emailQueue.add({ to, subject, text });
};

module.exports = addEmailToQueue;
