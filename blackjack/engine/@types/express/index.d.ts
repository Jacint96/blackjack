declare namespace Express {
  export interface Request extends Express.Request {
    email?: string
    uid?: string
  }
}
