import * as TYPES from './constants'
const { shuffle, newDecks } = require('52-deck')
import type { SideBets, Rule, State } from './types'

export const getDefaultSideBets = (active = false): SideBets => {
  return {
    luckyLucky: active,
    perfectPairs: active,
    royalMatch: active,
    luckyLadies: active,
    inBet: active,
    MatchTheDealer: active,
  }
}

export const getRules = ({
  decks = 1,
  standOnSoft17 = true,
  double = 'any',
  split = true,
  doubleAfterSplit = true,
  surrender = true,
  insurance = true,
  showdownAfterAceSplit = true,
}: Rule) => {
  return {
    decks: decks || 1,
    standOnSoft17: standOnSoft17,
    double: double,
    split: split,
    doubleAfterSplit: doubleAfterSplit,
    surrender: surrender,
    insurance: insurance,
    showdownAfterAceSplit: showdownAfterAceSplit,
  }
}

export const defaultState = (rules: Rule): Partial<State> => {
  return {
    hits: 0,
    initialBet: 0,
    finalBet: 0,
    finalWin: 0,
    wonOnRight: 0,
    wonOnLeft: 0,
    stage: TYPES.STAGE_READY,
    deck: shuffle(newDecks(rules.decks)),
    handInfo: {
      left: {},
      right: {},
    },
    history: [],
    availableBets: getDefaultSideBets(true),
    sideBetsInfo: {},
    rules: rules,
    dealerHoleCard: void 0,
    dealerHasBlackjack: false,
    dealerHasBusted: false,
    dealerCards: [],
  }
}
