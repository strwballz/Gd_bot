const mongoose = require('mongoose');

const uriStd = 'mongodb://davedwave294_db_user:i5Q2bb6usfN0fNpL@ac-yle6mjr-shard-00-00.p1v2mzc.mongodb.net:27017,ac-yle6mjr-shard-00-01.p1v2mzc.mongodb.net:27017,ac-yle6mjr-shard-00-02.p1v2mzc.mongodb.net:27017/unimogbot?ssl=true&replicaSet=atlas-yle6mj-shard-0&authSource=admin&retryWrites=true&w=majority';

mongoose.connect(uriStd, { family: 4, serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('Connected with standard URI and IPv4!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed standard URI:', err.message);
    process.exit(1);
  });
