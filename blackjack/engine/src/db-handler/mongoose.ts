import mongoose from 'mongoose'
import envConfig from '../../environment'

export async function ensureDbConnection(): Promise<void> {
  if (mongoose.connection.readyState !== 0) return

  // Configure mongoose to use Promises, because callbacks are passe.
  mongoose.Promise = global.Promise

  // Connect to the Mongo DB
  try {
    await mongoose.connect(envConfig.mongoDb, {
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
