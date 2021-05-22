const { Game, actions, presets } = require('../../game-engine')

const mongoose = require('mongoose')
const redis = require('redis')
const User = require('../schema/user')

const dbHost = process.env.DOCKER ? 'blackjack-mongo:27018' : 'localhost'
mongoose
  .connect(`mongodb://${dbHost}/Blackjack`, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.info('Db connected!')
  })
  .catch((e) => {
    console.error('Mongoose connection error!')
    console.error(e)
  })

const redisHost = process.env.DOCKER ? 'blackjack-redis' : 'localhost'
const client = redis.createClient({ url: `redis://${redisHost}` })

const overrideRules = {
  decks: 6,
  insurance: false,
}

module.exports = {
  start: (req, res) => {
    const game = new Game(null, presets.getRules(overrideRules))
    const afterDealState = game.dispatch(actions.deal({ bet: parseInt(req.params.bet) }))
    client.set(req.uid.toString(), JSON.stringify(afterDealState))
    res.send(afterDealState)
  },

  end: (req, res) => {
    client.del(req.uid.toString())
    res.sendStatus(200)
  },

  getState: (req, res) => {
    client.get(req.uid.toString(), (err, state) => {
      if (!err) {
        res.send(state)
      } else {
        res.sendStatus(500)
      }
    })
  },

  doAction: (req, res) => {
    client.get(req.uid.toString(), (err, state) => {
      if (!err) {
        const game = new Game(JSON.parse(state))
        let newState

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
          default:
            res.sendStatus(404)
        }

        if (newState.stage === 'done') {
          User.findOne({ email: req.email }, (err, doc) => {
            if (!err) {
              if (doc) {
                let newBalance = doc.balance + newState.wonOnLeft + newState.wonOnRight

                if (newState.wonOnLeft === 0 && newState.wonOnRight === 0) {
                  newBalance -= newState.finalBet
                }

                User.findOneAndUpdate({ email: req.email }, { $set: { balance: newBalance } }, (err, doc) => {
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

        client.set(req.uid.toString(), JSON.stringify(newState))
        res.send(newState)
      } else {
        res.sendStatus(500)
      }
    })
  },
}