import * as redis from 'redis'
import envConfig from '../../environment'

export class RedisHandler {
  static sharedInstance = new RedisHandler()
  private readonly privateClient: redis.RedisClient

  get client(): redis.RedisClient {
    return this.privateClient
  }

  private constructor() {
    this.privateClient = redis.createClient({ url: envConfig.redisHost })
  }
}
