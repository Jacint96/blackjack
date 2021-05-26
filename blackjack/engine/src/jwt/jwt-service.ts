import * as jwt from 'jsonwebtoken'
import config from '../config/config.json'

const verify = <T extends { email: string }>(token: string): Promise<T | void> =>
  new Promise((resolve, reject) => {
    jwt.verify(token, config.userJwtSecret, (err, decoded) => {
      if (err) return reject(err)
      resolve(decoded as T | undefined)
    })
  })

const JwtServices = { verify }

export default JwtServices
