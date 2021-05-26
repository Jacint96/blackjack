import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '.env') })

interface Environment {
  mongoDb: string
}

const envConfig: Environment = {
  mongoDb: process.env.MONGODB_URI ?? 'mongodb://localhost:27017',
}

export default envConfig
