const mongoose = require('mongoose');

const uri = 'mongodb+srv://davedwave294_db_user:i5Q2bb6usfN0fNpL@cluster0.p1v2mzc.mongodb.net/unimogbot?retryWrites=true&w=majority';

console.log('Testing connection...');
mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('Success!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
