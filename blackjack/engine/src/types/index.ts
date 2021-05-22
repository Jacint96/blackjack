export type Action = {
  type: string
  payload?: any
}

export type AvailableActions = {
  double: boolean
  split: boolean
  insurance: boolean
  hit: boolean
  stand: boolean
  surrender: boolean
}

export type Card = {
  text: string
  suite: string
  value: number
  color: string
}

export type HandValue = {
  hi: number
  lo: number
}

export type Hand = {
  cards: Array<Card>
  playerValue: HandValue
  playerHasBlackjack: boolean
  playerHasBusted: boolean
  playerHasSurrendered: boolean
  close: boolean
  availableActions: AvailableActions
  bet: number
}

export type HandInfo = {
  left: Partial<Hand>
  right: Partial<Hand>
}

export type SideBets = {
  luckyLucky: boolean
  perfectPairs: boolean
  royalMatch: boolean
  luckyLadies: boolean
  inBet: boolean
  MatchTheDealer: boolean
}

export type Rule = {
  decks: number
  standOnSoft17: boolean
  double: string
  doubleAfterSplit: boolean
  split: boolean
  surrender: boolean
  insurance: boolean
  showdownAfterAceSplit: boolean
}

export type State = {
  hits: number
  initialBet: number
  finalBet: number
  finalWin: number
  wonOnRight: number
  wonOnLeft: number
  stage: string
  deck: Array<Card>
  handInfo: HandInfo
  history: Array<any>
  availableBets: SideBets
  sideBetsInfo: any
  rules: Rule
  dealerCards: Array<Card>
  dealerHoleCard?: Card
  dealerHasBlackjack: boolean
  dealerHasBusted: boolean
  dealerValue: HandValue
  cardCount: number
}
