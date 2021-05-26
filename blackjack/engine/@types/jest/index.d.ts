declare global {
  namespace jest {
    interface Matchers<R, T = {}> extends jest.Matchers<R, T> {
      eqWithMsg(received: any, target: any, message: string | null = null, strict = true): R
    }
  }
}
