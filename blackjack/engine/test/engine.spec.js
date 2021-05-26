const { serializeCards } = require('52-deck')
const lib = require('../src/engine')

describe('calculate()', function () {
  it('should return hi/lo value when cards contains "Ace"', function () {
    const cards = serializeCards('♠1 ♥5')
    const values = lib.calculate(cards)
   
    expect(values.hi).eqWithMsg(16, 'hi')
    expect(values.lo).eqWithMsg(6, 'lo')
  })

  it('should return hi/lo value when cards contains 2 "Aces"', function () {
    const cards = serializeCards('♠1 ♣5 ♣1')
    const values = lib.calculate(cards)
    expect(values.hi).eqWithMsg(17, 'hi')
    expect(values.lo).eqWithMsg(7, 'lo')
  })

  it('should return hi === lo when hi busted', function () {
    const cards = serializeCards('♥5 ♣1 ♠1 ♦5')
    const values = lib.calculate(cards)
    expect(values.hi).eqWithMsg(12, 'hi')
    expect(values.lo).eqWithMsg(12, 'lo')
  })

  describe('blackjack', function () {
    ;['♥1 ♣10 ♥K', '♥1 ♣J', '♣2 ♥1 ♠1 ♦1 ♥4 ♦2'].forEach(function (value) {
      it(`${value}`, function () {
        const cards = serializeCards(value)
        const result = lib.calculate(cards).hi
        expect(result).eqWithMsg(21)
      })
    })
  })
})

describe('prize calculation', function () {
  it('should pay according the standard game rule (no BJ)', function () {
    const playerCards = serializeCards('♠J ♣9')
    const playerValue = lib.calculate(playerCards)
    const dealerCards = serializeCards('♣J ♣8')
    const initialBet = 1
    const playerHand = {
      close: true,
      playerInsuranceValue: 0,
      playerHasSurrendered: false,
      playerHasBlackjack: false,
      playerHasBusted: false,
      playerValue: playerValue,
      bet: initialBet,
    }
    expect(lib.getPrize(playerHand, dealerCards)).eqWithMsg(initialBet * 2, 'player Won twice')
    expect(lib.getPrize(playerHand, dealerCards.concat(serializeCards('♥1')))).eqWithMsg(initialBet, 'player Push (bet value is returned')
    expect(lib.getPrize(playerHand, dealerCards.concat(serializeCards('♥2')))).eqWithMsg( 0, 'player lose')
  })
  it('should pay insurance when dealer has BJ', function () {
    const playerCards = serializeCards('2d 3d')
    const playerValue = lib.calculate(playerCards)
    const dealerCards = serializeCards('1d 11d')
    const initialBet = 10
    const playerHand = {
      close: true,
      playerInsuranceValue: 5,
      playerHasSurrendered: false,
      playerHasBlackjack: false,
      playerHasBusted: false,
      playerValue: playerValue,
      bet: initialBet,
    }
    const prize = lib.getPrize(playerHand, dealerCards)
    expect(prize).eqWithMsg(0, `insurance does not pay on right side`)
  })
  it('should NOT pay insurance when dealer has BJ and first card is NOT Ace', function () {
    const playerCards = serializeCards('2d 3d')
    const playerValue = lib.calculate(playerCards)
    const dealerCards = serializeCards('11d 1d')
    const initialBet = 10
    const insuranceBet = 5
    const playerHand = {
      close: true,
      playerInsuranceValue: 5,
      playerHasSurrendered: false,
      playerHasBlackjack: false,
      playerHasBusted: false,
      playerValue: playerValue,
      bet: initialBet,
    }
    const prize = lib.getPrize(playerHand, dealerCards)
    expect(lib.isBlackjack(dealerCards)).eqWithMsg(true, 'dealer has blackjack')
    expect(dealerCards[0].value).not.eqWithMsg(1, 'first cards IS NOT an Ace')
    expect(prize).eqWithMsg(insuranceBet * 0, `it should not pay insurance when first card is not Ace`)
  })
  it('should NOT pay BJ after split', function () {
    const hasSplit = true
    const playerCards = serializeCards('1d 10d')
    const playerValue = lib.calculate(playerCards)
    const dealerCards = serializeCards('10d 7d')
    const initialBet = 10
    const playerHand = {
      close: true,
      playerInsuranceValue: 5,
      playerHasSurrendered: false,
      playerHasBlackjack: lib.isBlackjack(playerCards) && hasSplit === false,
      playerHasBusted: false,
      playerValue: playerValue,
      bet: initialBet,
    }
    const prize = lib.getPrize(playerHand, dealerCards)
    expect(lib.isBlackjack(dealerCards)).eqWithMsg(false, 'dealer has not blackjack')
    expect(prize).eqWithMsg(initialBet * 2, `it should pay double, not bonus`)
  })
})

describe('Soft Hand', function () {
  describe('# are all soft hands', function () {
    ;['1d 3d 3s', '1d 6h', '1d 2h 4h', '1d 1h 5s'].forEach((cards) => {
      it(cards, function () {
        expect(lib.isSoftHand(serializeCards(cards))).ok
      })
    })
  })
  describe('# are not soft hands', function () {
    ;['10d 7d', '7d 9h', '5d 2h 9h'].forEach((cards) => {
      it(cards, function () {
        expect(!lib.isSoftHand(serializeCards(cards))).ok
      })
    })
  })
})
