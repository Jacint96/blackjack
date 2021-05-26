import * as TYPES from './constants'
import type { Action, Card } from './types'

export const invalid = (action: Action, info: any): Action => {
  return {
    type: TYPES.INVALID,
    payload: {
      type: action.type,
      payload: action.payload,
      info: info,
    },
  }
}

export const restore = (): Action => {
  return {
    type: TYPES.RESTORE,
  }
}

export const deal = ({ bet = 10, sideBets = { luckyLucky: 0 } }: { bet?: number; sideBets?: any } = {}): Action => {
  return {
    type: TYPES.DEAL,
    payload: {
      bet,
      sideBets,
    },
  }
}

export const insurance = (bet?: { bet?: number }): Action => {
  return {
    type: TYPES.INSURANCE,
    payload: {
      bet: bet?.bet ?? 0,
    },
  }
}

export const split = (): Action => {
  return {
    type: TYPES.SPLIT,
  }
}

export const hit = ({ position = 'right' }: { position: string }): Action => {
  return {
    type: TYPES.HIT,
    payload: {
      position,
    },
  }
}

export const double = ({ position = 'right' }: { position: string }): Action => {
  return {
    type: TYPES.DOUBLE,
    payload: {
      position,
    },
  }
}

export const stand = ({ position = 'right' }: { position: string }): Action => {
  return {
    type: TYPES.STAND,
    payload: {
      position,
    },
  }
}

export const surrender = (): Action => {
  return {
    type: TYPES.SURRENDER,
  }
}

// @ts-ignore
export const showdown = ({ dealerHoleCardOnly = false }: { dealerHoleCardOnly: boolean } = {}): Action => {
  return {
    type: TYPES.SHOWDOWN,
    payload: {
      dealerHoleCardOnly,
    },
  }
}

// @ts-ignore
export const dealerHit = ({ dealerHoleCard }: { dealerHoleCard: Card } = {}): Action => {
  return {
    type: TYPES.DEALER_HIT,
    payload: {
      dealerHoleCard,
    },
  }
}
