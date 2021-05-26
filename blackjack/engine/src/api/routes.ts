import express from 'express'
import { authMiddleware } from './middleware/auth'
import identityHandlers from './controllers/identity'
import gameController from './controllers/game'

const router = express.Router()

router.route('/').get((req, res) => {
  res.sendStatus(200)
})

// Identity
router.route('/identity/register').post(identityHandlers.register)
router.route('/identity/login').post(identityHandlers.login)
router.route('/identity/delete').post(identityHandlers.delete)
// @ts-ignore
router.use(authMiddleware).route('/identity/password/change').post(identityHandlers.changePassword)
router.route('/identity/password/reset/token').post(identityHandlers.generatePasswordResetToken)
router.route('/identity/password/reset/verify').post(identityHandlers.verifyPasswordResetToken)
router.route('/identity/password/reset').post(identityHandlers.resetPassword)
// @ts-ignore
router.use(authMiddleware).route('/identity/balance').get(identityHandlers.getBalance)
// @ts-ignore
router.use(authMiddleware).route('/identity/topup').get(identityHandlers.topup)

// Game
// @ts-ignore
router.use(authMiddleware).route('/game/start/:bet').get(gameController.start)
// @ts-ignore
router.use(authMiddleware).route('/game/end').get(gameController.end)
// @ts-ignore
router.use(authMiddleware).route('/game/state').get(gameController.getState)
// @ts-ignore
router.use(authMiddleware).route('/game/action/:action/:option?').get(gameController.doAction)

module.exports = router
