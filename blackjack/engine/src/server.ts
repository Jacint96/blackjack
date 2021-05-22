import cors from 'cors'
import chalk from 'chalk'
import express from 'express'
import bodyParser from 'body-parser'

// const express = require('express')
const routes = require('./api/routes')
const morgan = require('morgan')

const app = express()

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

// Listen on port
app.listen(6001)
