import * as express from 'express'
import * as bodyParser from 'body-parser'
import { config } from './env'
import { logMiddleware, createLogger } from './logger'
import api from './api'

export function createServer(id: number): void {
  const { app, log } = createApp(id)
  const port = config.port

  const server = app.listen(port, () => {
    log.info(
      `App is running at http://localhost:${port}/ in ${app.get('env')} mode.`
    )
    log.info('Press CTRL-C to stop.')
  })

  process.on('SIGTERM', () => {
    server.close(() => {
      log.info(`Server stopped. App received SIGTERM`)
    })
  })
}

export function createApp(id: number) {
  const log = createLogger('game-api-entry')
  log.fields.workerId = id
  const app = express()

  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())
  app.use(logMiddleware)

  app.use('/api', api)

  app.use(errorHandler)

  return { app, log }
}

function errorHandler(
  ex: any,
  req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) {
  const logger = req.log

  logger.error({ ex }, 'Unhandled error')
  res.status(ex.status || 500).send({ message: 'Internal server error' })
  return
}
