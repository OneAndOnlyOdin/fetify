import * as core from 'express-serve-static-core'
import { Logger } from './logger'
import { User } from './domain/user/types'

declare module 'express-serve-static-core' {
  interface Request {
    log: Logger
    user?: User
  }
}
