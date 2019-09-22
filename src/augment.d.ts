import * as core from 'express-serve-static-core'
import { Logger } from './logger'

declare module 'express-serve-static-core' {
  interface Request {
    log: Logger
    paging?: {
      page: number
      size: number
    }
  }
}
