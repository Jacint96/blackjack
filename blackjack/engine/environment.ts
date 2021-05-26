import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '.env') })

interface Environment {
  mongoDb: string
  redisHost: string
}

const envConfig: Environment = {
  mongoDb: process.env.MONGODB_URI ?? 'mongodb://localhost:27017',
  redisHost: process.env.REDIS_HOST ?? 'redis://localhost:6379',
}

export default envConfig
