import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import { config } from './env'
import { logMiddleware, createLogger } from './logger'
import api from './api'
import front from './api/front'
import { setupWebsocketServer } from './sockets'
import { CommandError } from './es/errors'

export function createServer(id: number): void {
  const { app, log } = createApp(id)
  const port = config.port

  const server = app.listen(port, () => {
    log.info(`App is running at http://localhost:${port}/ in ${app.get('env')} mode.`)
    log.info('Press CTRL-C to stop.')
  })

  const { interval } = setupWebsocketServer(server)

  process.on('SIGTERM', () => {
    server.close(() => {
      clearInterval(interval)
      log.info(`Server stopped. App received SIGTERM`)
    })
  })
}

export function createApp(id: number) {
  const log = createLogger('api')
  log.fields.workerId = id
  const app = express()

  app.use(cors())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())
  app.use(logMiddleware)

  app.use('/api', api)
  app.use(front)

  app.use(errorHandler)

  return { app, log }
}

function errorHandler(
  err: any,
  req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) {
  const logger = req.log

  if (err instanceof CommandError) {
    res.status(400).send({ message: 'Bad request' })
    return
  }

  logger.error({ err }, 'Unhandled error')
  const message = err.status ? err.message : 'Internal server error'
  res.status(err.status || 500).send({ message })
  return
}
