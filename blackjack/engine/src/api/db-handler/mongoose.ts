import mongoose from 'mongoose'

export async function ensureDbConnection(): Promise<void> {
  if (mongoose.connection.readyState !== 0) return

  const dbHost = process.env.DOCKER ? 'blackjack-mongo:27018' : 'localhost'

  // Configure mongoose to use Promises, because callbacks are passe.
  mongoose.Promise = global.Promise

  // Connect to the Mongo DB
  try {
    await mongoose.connect(`mongodb://${dbHost}/Blackjack`, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
    })
  } catch (e) {
    console.error('Error while connecting to the DB!')
    console.error(e)
    process.exit(1)
  }
}
