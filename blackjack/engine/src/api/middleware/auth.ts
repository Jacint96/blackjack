import User from '../schema/user'
import JwtServices from '../../jwt/jwt-service'

import { Request, Response, NextFunction } from 'express'

export const authMiddleware = async (
  req: Request<{ uid: string; email: string }>,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers?.authorization

  if (!token) {
    res.sendStatus(401)
    return
  }

  // Ez itt, ha ismered az Either monadot, egy tök olyan működödésű megvalósítás
  // el akarom kerülni a fölösleges imperatív let valtozo aztán változó felülírás patternt
  const tokenVerificationResult = await (JwtServices.verify(token)
    .then((success) => ({ success: success ?? null, error: null }))
    .catch((error: Error) => ({ success: null, error })) as Promise<{
    success: null | { email: string }
    error: null | Error
  }>)

  if (!tokenVerificationResult.success || tokenVerificationResult.error) {
    console.error(tokenVerificationResult.error)
    console.error(`Failed to verify token! It was probably invalid: ${token}`)
    res.sendStatus(401)
  }

  try {
    const user = await User.findOne({ email: tokenVerificationResult.success!.email })
    if (!user) {
      res.status(404)
      res.send('Cannot find your user!')
      return
    }

    ;(req as any).uid = user._id
    ;(req as any).email = tokenVerificationResult.success!.email

    await next()
  } catch (e) {
    console.error(e)
    res.sendStatus(500)
  }
}
