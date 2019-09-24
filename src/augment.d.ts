import * as core from 'express-serve-static-core'
import { Logger } from './logger'
import { User } from './domain/user/types'
import * as Socket from 'ws'

declare module 'express-serve-static-core' {
  interface Request {
    log: Logger
    user?: User
  }
}

declare module 'ws' {
  class WebSocket extends Socket {
    userId?: string
  }
}
