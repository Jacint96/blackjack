const mongoose = require('mongoose');

module.exports = function () {
    const dbHost = process.env.DOCKER ? 'blackjack-mongo:27018' : 'localhost'

  // Configure mongoose to use Promises, because callbacks are passe.
  mongoose.Promise = global.Promise;

  // Connect to the Mongo DB
  return mongoose.connect(`mongodb://${dbHost}/Blackjack`, {
    useUnifiedTopology: true,  
    useNewUrlParser: true,
    useFindAndModify: false,
  });
};


