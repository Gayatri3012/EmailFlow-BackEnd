const Agenda = require('agenda');
require('dotenv').config();

const mongoConnectionString = process.env.MONGO_URI; 

const agenda = new Agenda({ db: { address: mongoConnectionString, collection: 'scheduledEmails' } });

(async function () {
  await agenda.start();
  console.log('Agenda started');
})();

module.exports = agenda;