import cors from 'cors'
import chalk from 'chalk'
import express from 'express'
import bodyParser from 'body-parser'
import { ensureDbConnection } from './api/db-handler/mongoose'

// const express = require('express')
const routes = require('./api/routes')
const morgan = require('morgan')

const app = express()

const PORT = 6001

app.use(cors())
app.use(bodyParser.json())

// Request logging
const colorizeStatus = (status: string) => {
  if (status) {
    if (status.startsWith('2')) {
      return chalk.green(status)
    } else if (status.startsWith('4') || status.startsWith('5')) {
      return chalk.red(status)
    } else {
      return chalk.cyan(status)
    }
  } else {
    return null
  }
}

app.use(
  // TODO: later
  // @ts-ignore
  morgan((tokens, req, res) => {
    return [
      chalk.grey(new Date().toISOString()),
      chalk.yellow(tokens.method(req, res)),
      tokens.url(req, res),
      colorizeStatus(tokens.status(req, res)),
      `(${tokens['response-time'](req, res)} ms)`,
    ].join(' ')
  }),
)

// API routes
app.use('/api', routes)

ensureDbConnection()
  .then(() => {
    // Listen on port
    app.listen(PORT, () => {
      console.info(`Server is istening on port: ${PORT}`)
    })
  })
  .catch((e) => {
    console.error(e)
    console.error('Failed to connect to your DB!')
    process.exit(1)
  })
