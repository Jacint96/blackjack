module.exports = {
  hooks: {
    // 'pre-commit': 'npm run lint && npm run ts-check && npm run gitlab:validate',
    'pre-commit': 'yarn run lint && yarn run ts-check'
  },
}
