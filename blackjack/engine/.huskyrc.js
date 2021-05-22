module.exports = {
  hooks: {
    'pre-commit': 'yarn run lint && yarn run ts-check'
  },
}
