import { serializeCards } from '52-deck'
import * as engine from '../src/engine'
import { getRules } from '../src/presets'
import * as actions from '../src/actions'
import Game from '../src/game'

const executeFlow = (rules = {}, cards, activity) => {
  const game = new Game(null, getRules(rules))
  let status = game.getState()
  status.deck = status.deck.concat(serializeCards(cards))
  activity.forEach((fn) => {
    // this is simulating the re-initialization done by an hypothetical server
    const instance = new Game(status)
    status = instance.dispatch(fn())
  })
  return status
}

const functions = {
  restore: () => actions.restore(),
  deal: () => actions.deal({ bet: 10 }),
  deal20: () => actions.deal({ bet: 20 }),
  'deal-luckyLucky': () => actions.deal({ bet: 10, sideBets: { luckyLucky: 10 } }),
  split: () => actions.split(),
  hitR: () => actions.hit({ position: 'right' }),
  hitL: () => actions.hit({ position: 'left' }),
  standR: () => actions.stand({ position: 'right' }),
  standL: () => actions.stand({ position: 'left' }),
  doubleR: () => actions.double({ position: 'right' }),
  doubleL: () => actions.double({ position: 'left' }),
  insuranceInjectAmount: () => actions.insurance({ bet: 100 }),
  insuranceYes: () => actions.insurance({ bet: 1 }),
  insurance5: () => actions.insurance({ bet: 5 }),
  insuranceNo: () => actions.insurance({ bet: 0 }),
}

const mapToActions = (actions) => actions.map((x) => functions[x])

describe('Action validations', function () {
  describe('#deal', function () {
    it('should have a default bet value', function () {
      const game = new Game()
      game.dispatch(actions.deal())
    })
  })
})
describe('Game flow', function () {
  describe('# Finish the game', function () {
    ;[
      {
        cards: '♠10 ♦1 ♥5 ♣6 ♠11 ♦10',
        actions: ['restore', 'deal', 'split', 'standR'],
        stage: 'done',
        finalWin: 0,
      },
      {
        cards: '♥3 ♣3 ♠2 ♦2',
        actions: ['restore', 'deal', 'split', 'standR'],
        stage: 'player-turn-left',
        finalWin: 0,
      },
      {
        cards: '♣6 ♣6 ♣6 ♥3 ♣3 ♠2 ♦2',
        actions: ['restore', 'deal', 'split', 'standR', 'doubleL'],
        stage: 'done',
        finalWin: 0,
      },
      {
        // force showdown after splitting ace rule ON.
        // in this case we want to terminate the game even if right side has 20
        cards: '♥9 ♦K ♥3 ♣3 ♠1 ♦1',
        actions: ['restore', 'deal', 'split'],
        stage: 'done',
        finalWin: 0,
        rules: {
          showdownAfterAceSplit: true,
        },
      },
      {
        // force showdown after splitting ace rule OFF.
        // in this case the game is not closed on left
        cards: '♥9 ♦K ♥3 ♣3 ♠1 ♦1',
        actions: ['restore', 'deal', 'split'],
        stage: 'player-turn-right',
        finalWin: 0,
        rules: {
          showdownAfterAceSplit: false,
        },
      },
    ].forEach((test) => {
      it(`should deal ${test.cards} execute ${test.actions.join('-')} and finish`, function () {
        const state = executeFlow(
          test.rules,
          test.cards,
          test.actions.map((x) => functions[x]),
        )
        if (test.stage) {
          expect(state.stage).eqWithMsg(test.stage, `${test.cards} exit stage is ${state.stage} instead of ${test.stage}`)
        }
        if (test.finalWin) {
          expect(state.finalWin).eqWithMsg(test.finalWin)
        }
      })
    })
    it('should finish the game when player hits 21 (soft)', function () {
      const cards = '♠6 ♠5 ♥10 ♦10 ♦1 ♦9'
      const actions = ['restore', 'deal', 'hitR', 'hitR']
      const rules = {
        decks: 1,
        standOnSoft17: true,
        double: 'any',
        split: true,
        doubleAfterSplit: true,
        showdownAfterAceSplit: true,
      }
      const state = executeFlow(
        rules,
        cards,
        actions.map((x) => functions[x]),
      )
      const {
        stage,
        wonOnRight,
        handInfo: { right },
      } = state
      expect(right.playerValue.hi).eqWithMsg(21, 'Player has 21 on right')
      expect(stage).eqWithMsg('done', 'game is over')
      expect(wonOnRight).eqWithMsg(10 * 2, 'Won')
    })
  })
  describe('# insurance dealer BJ', function () {
    const test = {
      cards: '♦10 ♥1 ♦3 ♦3',
    }
    it(`INSURANCE ON: should deal ${test.cards} and wait for "insurance" YES or NO`, function () {
      const actions = ['restore', 'deal']
      const rules = { insurance: true }
      const state = executeFlow(
        rules,
        test.cards,
        actions.map((x) => functions[x]),
      )
      const {
        handInfo: {
          right: { availableActions },
        },
      } = state
      expect(state.stage).eqWithMsg('player-turn-right', 'blackjack but insurance is ON and first card is ♥1')
      expect(state.dealerHasBlackjack).eqWithMsg(false, 'blackjack is still a secret here')
      expect(availableActions.insurance).eqWithMsg(true, 'can insure')
      expect(availableActions.double).eqWithMsg(false, 'double should not be allowed')
      expect(availableActions.split).eqWithMsg(false, 'split should not be allowed')
      expect(availableActions.hit).eqWithMsg(false, 'hit should not be allowed')
      expect(availableActions.surrender).eqWithMsg(false, 'surrender should not be allowed')
      expect(availableActions.stand).eqWithMsg(false, 'stand should not be allowed')
    })
    it('should pay insurance and summary should appears in props "sideBetsInfo"', () => {
      const actions = ['restore', 'deal', 'insurance5']
      const rules = { insurance: true }
      const state = executeFlow(
        rules,
        '♦10 ♥1 ♦3 ♦3',
        actions.map((x) => functions[x]),
      )
      const {
        sideBetsInfo: {
          insurance: { risk, win },
        },
      } = state
      expect(risk).eqWithMsg(5, 'insurance risk value is half of 10')
      expect(win).eqWithMsg(risk * 3, 'insurance win value is 10 + bet = 15')
    })
    it('should not pay insurance and summary should appears in props "sideBetsInfo"', () => {
      const actions = ['restore', 'deal', 'insurance5']
      const rules = { insurance: true }
      const state = executeFlow(
        rules,
        '♦3 ♥1 ♦3 ♦3',
        actions.map((x) => functions[x]),
      )
      const {
        sideBetsInfo: {
          insurance: { risk, win },
        },
      } = state
      expect(risk).eqWithMsg(5, 'insurance risk value is 5')
      expect(win).eqWithMsg(0 ,'insurance win value is 0')
    })
    it(`INSURANCE ON: should deal ${test.cards}, insure YES, and finish`, function () {
      const actions = ['restore', 'deal', 'insuranceYes']
      const rules = { insurance: true }
      const state = executeFlow(
        rules,
        test.cards,
        actions.map((x) => functions[x]),
      )
      const {
        finalBet,
        wonOnRight,
        handInfo: { right },
        sideBetsInfo: {
          insurance: { win },
        },
      } = state
      expect(state.stage).eqWithMsg('done', 'blackjack but insurance is ON and first card is ♥1')
      expect(finalBet).eqWithMsg(15, 'bet 10 and insurance 1')
      expect(right.close).eqWithMsg(true, 'right hand should be close')
      expect(win).eqWithMsg(5 * 3, 'insurance pays 2 to 1 when dealer has bj + insurance value')
      expect(wonOnRight).eqWithMsg(0, 'right has no prize')
    })
    it(`INSURANCE ON: should deal ${test.cards}, insure YES, and finish`, function () {
      const actions = ['restore', 'deal20', 'insuranceYes']
      const rules = { insurance: true }
      const state = executeFlow(
        rules,
        test.cards,
        actions.map((x) => functions[x]),
      )
      const {
        finalBet,
        wonOnRight,
        handInfo: { right },
        sideBetsInfo: {
          insurance: { risk, win },
        },
      } = state
      expect(state.stage).eqWithMsg('done', 'blackjack but insurance is ON and first card is ♥1')
      expect(finalBet).eqWithMsg(20 + 10, 'bet 20 and insurance 10')
      expect(right.close).eqWithMsg(true, 'right hand should be close')
      expect(risk).eqWithMsg(10, 'insurance pays 2 to 1 when dealer has bj + insurance value')
      expect(win).eqWithMsg(30, 'insurance pays 2 to 1 when dealer has bj + insurance value')
      expect(wonOnRight).eqWithMsg(0, 'right has no prize')
    })
    it(`INSURANCE OFF: should deal ${test.cards} and finish`, function () {
      const actions = ['restore', 'deal']
      const rules = { insurance: false }
      const state = executeFlow(
        rules,
        test.cards,
        actions.map((x) => functions[x]),
      )
      expect(state.dealerHasBlackjack).eqWithMsg(true, 'blackjack is not a secret here')
      expect(state.stage).eqWithMsg('done', `${test.cards} stage is ${state.stage} instead of done`)
    })
  })
  describe('# insurance dealer no BJ', function () {
    it(`INSURANCE ON: should deal '♦5 ♥1 ♦2 ♦2' and wait for "insurance" YES or NO`, function () {
      const actions = ['restore', 'deal']
      const rules = { insurance: true }
      const state = executeFlow(
        rules,
        '♦5 ♥1 ♦2 ♦2',
        actions.map((x) => functions[x]),
      )
      const {
        handInfo: {
          right: { availableActions },
        },
      } = state
      expect(state.stage).eqWithMsg('player-turn-right', 'blackjack but insurance is ON and first card is ♥1')
      expect(availableActions.insurance).eqWithMsg(true, 'can insure')
      expect(availableActions.double).eqWithMsg(false, 'double should not be allowed')
      expect(availableActions.split).eqWithMsg(false, 'split should not be allowed')
      expect(availableActions.hit).eqWithMsg(false, 'hit should not be allowed')
      expect(availableActions.surrender).eqWithMsg(false, 'surrender should not be allowed')
      expect(availableActions.stand).eqWithMsg(false, 'stand should not be allowed')
    })
    it(`INSURANCE ON: prevent amount injection`, function () {
      const actions = ['restore', 'deal', 'insuranceInjectAmount', 'standR']
      const rules = { insurance: true }
      const state = executeFlow(
        rules,
        '♦5 ♥1 ♦2 ♦2',
        actions.map((x) => functions[x]),
      )
      const bet = 10
      const maxInsuranceAmount = bet / 2
      const {
        finalBet,
        wonOnRight,
        handInfo: { right },
        dealerHasBusted,
      } = state
      expect(state.stage).eqWithMsg('done', 'blackjack but insurance is ON and first card is ♥1')
      expect(right.playerValue.hi).eqWithMsg(4, 'player value must be 4')
      expect(finalBet).eqWithMsg(bet + maxInsuranceAmount, `bet ${bet} and max insurance ${maxInsuranceAmount}`)
      expect(right.close).eqWithMsg(true, 'right hand should be close')
      expect(wonOnRight).eqWithMsg(dealerHasBusted ? bet * 2 : 0, 'insurance pays 0 when dealer has no bj')
    })
    it(`INSURANCE OFF: should deal ${'♦5 ♥1 ♦2 ♦2'} and finish`, function () {
      const actions = ['restore', 'deal']
      const rules = { insurance: false }
      const state = executeFlow(
        rules,
        '♦5 ♥1 ♦2 ♦2',
        actions.map((x) => functions[x]),
      )
      expect(state.stage).eqWithMsg('player-turn-right', '♦5 ♥1 ♦2 ♦2')
    })
  })
  it('split on 10, have bj on left and bust on right', function () {
    const cards = '♠6 ♠6 ♦1 ♥5 ♣6 ♠11 ♦10'
    const actions = ['restore', 'deal', 'split', 'hitR', 'hitR', 'hitR']
    const rules = {
      decks: 1,
      standOnSoft17: true,
      double: 'any',
      split: true,
      doubleAfterSplit: true,
      surrender: true,
      insurance: true,
      showdownAfterAceSplit: true,
    }
    const state = executeFlow(
      rules,
      cards,
      actions.map((x) => functions[x]),
    )
    const {
      stage,
      handInfo: { left, right },
    } = state
    expect(stage).eqWithMsg('done', `split on 10 ${cards} exit stage is ${stage} instead of done`)
    expect(left.close).eqWithMsg(true, 'L is close')
    expect(left.playerHasBlackjack).eqWithMsg(false, 'L has 21')
    expect(right.playerHasBusted).eqWithMsg(true, 'R has busted')
  })
  it('slits bust on both and dealer showdown', function () {
    const cards = '♠10 ♦10 ♠10 ♦10 ♥2 ♣2 ♠9 ♦9'
    const actions = ['restore', 'deal', 'split', 'hitR', 'hitR', 'hitL', 'hitL']
    const rules = {
      decks: 1,
      standOnSoft17: true,
      double: 'any',
      split: true,
      doubleAfterSplit: true,
      surrender: true,
      insurance: true,
      showdownAfterAceSplit: true,
    }
    const state = executeFlow(
      rules,
      cards,
      actions.map((x) => functions[x]),
    )
    const {
      stage,
      handInfo: { left, right },
      dealerCards,
      finalWin = -1,
    } = state
    expect(stage).eqWithMsg('done', cards, `state is ${stage}`)
    expect(left.close).eqWithMsg(true, 'L is close')
    expect(left.close).eqWithMsg(true, 'L is close')
    expect(right.playerHasBusted).eqWithMsg(true, 'R has busted')
    expect(left.playerHasBusted).eqWithMsg(true, 'L has busted')
    expect(dealerCards.length).eqWithMsg(2, 'dealer has 2 cards')
    expect(finalWin).eqWithMsg(0, 'player lose')
  })
  it('no bj bonus after split', function () {
    const cards = '♠10 ♦10 ♠10 ♦10 ♥2 ♣2 ♠1 ♦1'
    const actions = ['restore', 'deal', 'split']
    const rules = {
      decks: 1,
      standOnSoft17: true,
      double: 'any',
      split: true,
      doubleAfterSplit: true,
      surrender: true,
      insurance: true,
      showdownAfterAceSplit: true,
    }
    const state = executeFlow(
      rules,
      cards,
      actions.map((x) => functions[x]),
    )
    const {
      stage,
      handInfo: { left, right },
      dealerHasBusted,
      wonOnLeft,
      wonOnRight,
    } = state
    expect(stage).eqWithMsg('done', cards)
    expect(dealerHasBusted).eqWithMsg(true, 'dealer has busted')
    expect(left.close).eqWithMsg(true, 'L is close')
    expect(right.close).eqWithMsg(true, 'R is close')
    expect(right.playerHasBlackjack).eqWithMsg(false, 'no BJ on right')
    expect(engine.calculate(right.cards).hi).eqWithMsg(21, '21 on right')
    expect(left.playerHasBlackjack).eqWithMsg(false, 'no BJ on left')
    expect(engine.calculate(left.cards).hi).eqWithMsg(21, '21 on left')
    expect(wonOnLeft).eqWithMsg(20, 'won 20 on left')
    expect(wonOnRight).eqWithMsg(20, 'won 20 on right')
  })
})

describe('Must Stand on 17', function () {
  it('stand on 17', function () {
    const cards = '11d 9s 9d 4s 12h 13d 13h 11h'
    const actions = ['restore', 'deal', 'split', 'standR', 'doubleL', 'standL']
    const rules = {
      decks: 1,
      standOnSoft17: true,
      double: 'any',
      split: true,
      doubleAfterSplit: true,
      showdownAfterAceSplit: true,
    }
    const state = executeFlow(
      rules,
      cards,
      actions.map((x) => functions[x]),
    )
    const {
      stage,
      finalBet,
      wonOnRight,
      wonOnLeft,
      dealerValue,
      handInfo: { left, right },
    } = state
    expect(stage).eqWithMsg('done', `${cards}`)
    expect(finalBet).eqWithMsg(30, 'Deal 10, Split 10, DoubleR 10')
    expect(wonOnLeft).eqWithMsg(0, 'Won 0 Left (busted)')
    expect(dealerValue.hi).eqWithMsg(20, 'Dealer must stop at 20')
    expect(right.playerValue.hi).eqWithMsg(19, 'Player Right position 19')
    expect(left.playerValue.hi).eqWithMsg(23, 'Player Left position 19')
    expect(wonOnRight).eqWithMsg(0, 'Won 0 on Right')
  })
})

describe('Side bets', function () {
  describe('Lucky Lucky', function () {
    it('777 suited should pays 200', function () {
      const dealerCards = serializeCards('7s')
      const playerCards = serializeCards('7s 7s')
      const x = engine.getLuckyLuckyMultiplier(playerCards, dealerCards)
      expect(x).eqWithMsg(200, 'LL multiplier')
    })
    it('777 NO-suited should pays 50', function () {
      const dealerCards = serializeCards('7h')
      const playerCards = serializeCards('7s 7s')
      const x = engine.getLuckyLuckyMultiplier(playerCards, dealerCards)
      expect(x).eqWithMsg(50, 'LL multiplier')
    })
    it('678 suited should pays 100', function () {
      const dealerCards = serializeCards('8s')
      const playerCards = serializeCards('6s 7s')
      const x = engine.getLuckyLuckyMultiplier(playerCards, dealerCards)
      expect(x).eqWithMsg(100, 'LL multiplier')
    })
    it('678 NO-suited should pays 30', function () {
      const dealerCards = serializeCards('8s')
      const playerCards = serializeCards('6s 7c')
      const x = engine.getLuckyLuckyMultiplier(playerCards, dealerCards)
      expect(x).eqWithMsg(30, 'LL multiplier')
    })
    it('21 suited should pays 10', function () {
      const dealerCards = serializeCards('10h')
      const playerCards = serializeCards('9h 2h')
      const x = engine.getLuckyLuckyMultiplier(playerCards, dealerCards)
      expect(x).eqWithMsg(10, 'LL multiplier')
    })
    it('21 NO-suited should pays 3', function () {
      const dealerCards = serializeCards('10c')
      const playerCards = serializeCards('9h 2h')
      const x = engine.getLuckyLuckyMultiplier(playerCards, dealerCards)
      expect(x).eqWithMsg(3, 'LL multiplier')
    })
    it('10 1 8 should pay luckyLucky', function () {
      const rules = {}
      const cards = '9h 10h 1c 8s'
      const actions = mapToActions(['restore', 'deal-luckyLucky'])
      const state = executeFlow(rules, cards, actions)
      const {
        handInfo: {
          right: { cards: playerCards },
        },
        dealerCards,
      } = state
      const sideBetsInfo = engine.getSideBetsInfo({ luckyLucky: true }, { luckyLucky: 10 }, playerCards, dealerCards)
      expect(sideBetsInfo.luckyLucky).eqWithMsg(20, 'amount is positive (engine)')
      expect(state.availableBets.luckyLucky).eqWithMsg(false, 'rule is OFF after deal')
      expect(state.sideBetsInfo.luckyLucky).eqWithMsg(20, 'amount is positive (game)')
    })
  })
})

describe('Showdown after aces split', () => {
  test('when showdownAfterAceSplit both sides must be closed', () => {
    const actions = ['restore', 'deal', 'split']
    const rules = {
      showdownAfterAceSplit: true,
    }
    const bet = 10
    const state = executeFlow(
      rules,
      '♥8 ♥8 ♥1 ♦4 ♥10 ♦1 ♦1',
      actions.map((x) => functions[x]),
    )
    const { stage, initialBet, finalBet, dealerHasBusted, dealerValue, handInfo, wonOnLeft, wonOnRight } = state
    const { left, right } = handInfo
    expect(stage).eqWithMsg('done', 'stage is done')
    expect(finalBet).eqWithMsg(initialBet * 2, 'final bet is twice initial bet')
    expect(dealerHasBusted).eqWithMsg(true, 'dealer has busted')
    expect(dealerValue.hi).eqWithMsg(22, 'dealer value is 22')
    expect(left.playerValue.hi).eqWithMsg(12, 'player left high value is 12 = ♦1 + ♥1')
    expect(right.playerValue.hi).eqWithMsg(19, 'player right high value is 19 = ♦1 + ♥8')
    expect(left.close).eqWithMsg(true, 'left hand should be closed')
    expect(right.close).eqWithMsg(true, 'right hand should be closed')
    expect(wonOnLeft).eqWithMsg(20, 'won something on left')
    expect(wonOnRight).eqWithMsg(20, 'won something on right')
  })
})

describe('History detail for each action', () => {
  test('hit should have side cards', () => {
    const cards = '♠6 ♠5 ♥10 ♦10 ♦1 ♦9'
    const actions = ['restore', 'deal', 'hitR', 'hitR']
    const rules = {}
    const state = executeFlow(
      rules,
      cards,
      actions.map((x) => functions[x]),
    )
    const {
      history: [restore, deal, firstHit, secondHit],
    } = state
    expect(firstHit.right.length === 3).ok // HIT action has 3 cards
    expect(secondHit.right.length === 4).ok // HIT action has 3 cards
  })
  test('double should have side cards', () => {
    const cards = '♠6 ♠5 ♥10 ♦10 ♦1 ♦9'
    const actions = ['restore', 'deal', 'doubleR']
    const rules = {}
    const state = executeFlow(
      rules,
      cards,
      actions.map((x) => functions[x]),
    )
    const {
      history: [restore, deal, double],
    } = state
    expect(deal.right.length === 2).ok //2 cards on right after deal
    expect(double.right.length === 3).ok // 3 cards on right after double
  })
})

describe('No matter how many aces ... soft hands do not busts', () => {
  it('should not bust when "lo" is still under 22', () => {
    const cards = '♥5 ♣1 ♥4 ♣9 ♠1 ♦5'
    const actions = ['restore', 'deal', 'hitR', 'hitR']
    const rules = {
      decks: 1,
      standOnSoft17: true,
      double: 'any',
      split: true,
      doubleAfterSplit: true,
      showdownAfterAceSplit: true,
    }
    const state = executeFlow(
      rules,
      cards,
      actions.map((x) => functions[x]),
    )
    const {
      handInfo: { right },
    } = state
    const {
      playerValue: { hi, lo },
      playerHasBusted,
      close,
    } = right
    expect(lo).eqWithMsg(12)
    expect(hi).eqWithMsg(12)
    expect(playerHasBusted).eqWithMsg(false, 'Player should be 12 not 22')
    expect(close).eqWithMsg(false, 'Right should be open at 12')
  })
  it('should pay on handValue.lo', () => {
    const cards = '♥8 ♥5 ♣1 ♥4 ♣9 ♠1 ♦5'
    const actions = ['restore', 'deal', 'hitR', 'hitR', 'standR']
    const rules = {
      decks: 1,
      standOnSoft17: true,
      double: 'any',
      split: true,
      doubleAfterSplit: true,
      showdownAfterAceSplit: true,
    }
    const state = executeFlow(
      rules,
      cards,
      actions.map((x) => functions[x]),
    )
    const {
      handInfo: { right },
      dealerValue,
      wonOnRight,
    } = state
    const {
      playerValue: { hi, lo },
      playerHasBusted,
    } = right
    expect(lo).eqWithMsg(12)
    expect(hi).eqWithMsg(12)
    expect(dealerValue.lo).eqWithMsg(21, 'dealer has 21 on lo')
    expect(dealerValue.hi).eqWithMsg(21, 'dealer has 21 on hi')
    expect(playerHasBusted).eqWithMsg(false, 'Player should be 12 not 22')
    expect(wonOnRight).eqWithMsg(0, 'player lose. dealer has 21, player 12 or 22')
  })
})
