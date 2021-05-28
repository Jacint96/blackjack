import express from 'express'
import gameController from './controllers/game'
import identityHandlers from './controllers/identity'

import { authMiddleware } from './middleware/auth'

const router = express.Router()

router.route('/').get((req, res) => {
  res.sendStatus(200)
})

// Identity
// GET


// POST
router.route('/identity/register').post(identityHandlers.register)
router.route('/identity/login').post(identityHandlers.login)
router.route('/identity/delete').post(identityHandlers.delete)
router.use(authMiddleware).route('/identity/password/change').post(identityHandlers.changePassword)
router.route('/identity/password/reset/token').post(identityHandlers.generatePasswordResetToken)
router.route('/identity/password/reset/verify').post(identityHandlers.verifyPasswordResetToken)
router.route('/identity/password/reset').post(identityHandlers.resetPassword)
router.use(authMiddleware).route('/identity/credentials').get(identityHandlers.getCredentials)
router.use(authMiddleware).route('/identity/balance').get(identityHandlers.getBalance)
router.use(authMiddleware).route('/identity/topup').get(identityHandlers.topup)

// Game
router.use(authMiddleware).route('/game/start/:bet').get(gameController.start)
router.use(authMiddleware).route('/game/end').get(gameController.end)
router.use(authMiddleware).route('/game/state').get(gameController.getState)
router.use(authMiddleware).route('/game/action/:action/:option?').get(gameController.doAction)

export const mainRouter = router
