const Agenda = require('agenda');
require('dotenv').config();

const mongoConnectionString = process.env.MONGO_URI; 

// Initialize Agenda with MongoDB as the backend and use a scheduledEmails collection to store job data
const agenda = new Agenda({ db: { address: mongoConnectionString, collection: 'scheduledEmails' } });

// Start Agenda in an immediately invoked async function
(async function () {
  await agenda.start();
  console.log('Agenda started');
})();

module.exports = agenda;