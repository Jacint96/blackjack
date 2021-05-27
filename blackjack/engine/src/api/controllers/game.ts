import { Rule, State } from '../../types'
import { RedisHandler } from '../../redis-handler/redis-handler'
import { Request, Response } from 'express'
import { Game, actions, presets } from '../../game-engine'

import User from '../schema/user'

const client = RedisHandler.sharedInstance.client

const overrideRules = {
  decks: 8,
  insurance: false,
}

const gameController = {
  start: (req: Request, res: Response) => {
    client.get(req.uid!.toString(), (err, state) => {
      if (!err) {
        const game = new Game(null as any as State, presets.getRules(overrideRules as any as Rule))
        const afterDealState = game.dispatch(actions.deal({ bet: parseInt(req.params.bet, 10), sideBets: void 0 }))

        if (afterDealState.stage === 'done') {
          User.findOne({ email: req.email }, (err: Error, doc: any) => {
            if (!err) {
              if (doc) {
                let newBalance = doc.balance
                newBalance -= afterDealState.finalBet
                newBalance += afterDealState.wonOnLeft + afterDealState.wonOnRight

                User.findOneAndUpdate({ email: req.email }, { $set: { balance: newBalance } }, {}, (err, doc) => {
                  if (err || !doc) {
                    res.sendStatus(500)
                  }
                })
              } else {
                res.sendStatus(404)
              }
            } else {
              res.sendStatus(500)
            }
          })
        }

        client.set(req.uid!.toString(), JSON.stringify(afterDealState))
        res.send(afterDealState)
      } else {
        res.sendStatus(500)
      }
    })
  },

  end: (req: Request, res: Response) => {
    client.del(req.uid!.toString())
    res.sendStatus(200)
  },

  getState: (req: Request, res: Response) => {
    client.get(req.uid!.toString(), (err, state) => {
      if (!err) {
        res.send(state)
      } else {
        res.sendStatus(500)
      }
    })
  },

  doAction: (req: Request, res: Response) => {
    client.get(req.uid!.toString(), (err, state) => {
      if (!err) {
        const game = new Game(JSON.parse(state!))
        let newState: any

        switch (req.params.action) {
          case 'restore':
            newState = game.dispatch(actions.restore())
            break
          case 'insurance':
            newState = game.dispatch(actions.insurance())
            break
          case 'double':
            newState = game.dispatch(actions.double({ position: req.params.option }))
            break
          case 'split':
            newState = game.dispatch(actions.split())
            break
          case 'hit':
            newState = game.dispatch(actions.hit({ position: req.params.option }))
            break
          case 'stand':
            newState = game.dispatch(actions.stand({ position: req.params.option }))
            break
          case 'surrender':
            newState = game.dispatch(actions.surrender())
            break
          default:
            res.sendStatus(404)
        }

        if (newState.stage === 'done') {
          User.findOne({ email: req.email }, (err: Error, doc: any) => {
            if (!err) {
              if (doc) {
                let newBalance = doc.balance
                newBalance -= newState.finalBet
                newBalance += newState.wonOnLeft + newState.wonOnRight

                User.findOneAndUpdate({ email: req.email }, { $set: { balance: newBalance } }, {}, (err, doc) => {
                  if (err || !doc) {
                    res.sendStatus(500)
                  }
                })
              } else {
                res.sendStatus(404)
              }
            } else {
              res.sendStatus(500)
            }
          })
        }

        client.set(req.uid!.toString(), JSON.stringify(newState))
        res.send(newState)
      } else {
        res.sendStatus(500)
      }
    })
  },
}

export default gameController
