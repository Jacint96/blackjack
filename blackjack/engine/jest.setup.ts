expect.extend({
  eqWithMsg(received: any, target: any, message: string | null = null, strict = true) {
    console.info({ received, target, message, strict })
    if (!(strict ? target === received : target == received)) {
      return {
        pass: false,
        message: () => `Expected ${received} to equal ${target}. ${message ? `Message: ${message}` : ''}`,
      }
    }

    return { pass: true, message: () => `Expected ${received} to equal ${target}.` }
  },
})
