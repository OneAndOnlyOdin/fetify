import * as jwt from 'jsonwebtoken'
import { RequestHandler } from 'express'
import { config } from '../env'

export function wrap(handler: RequestHandler): RequestHandler {
  const wrapped: RequestHandler = async (req, res, next) => {
    try {
      await handler(req, res, next)
    } catch (err) {
      next(err)
    }
  }

  return wrapped
}

export class StatusError extends Error {
  constructor(public msg: string, public status: number) {
    super(msg)
  }
}

export const authMiddleware: RequestHandler = (req, _, next) => {
  const header = req.header('authorization')
  const unauthed = new StatusError('Not authorized', 401)
  if (!header) {
    return next(unauthed)
  }

  if (!header.startsWith('Bearer ')) {
    return next(unauthed)
  }

  const token = header.replace('Bearer ', '')

  try {
    const result = jwt.verify(token, config.jwtSecret)
    if (typeof result === 'string') {
      const user = JSON.parse(result)
      req.user = user
      return next()
    }

    req.user = result as any
    next()
  } catch (err) {
    req.log.error({ err }, 'Failed to verify token')
    return next(new Error('Internal server error'))
  }
}
