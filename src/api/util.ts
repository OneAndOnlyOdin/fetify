import * as jwt from 'jsonwebtoken'
import { RequestHandler, Request } from 'express'
import { config } from '../env'
import { getUserByKey } from '../domain/user/store'

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

export const authMiddleware: RequestHandler = async (req, _, next) => {
  const apiKey = req.header('x-api-key')
  if (apiKey) {
    const user = await getUserByKey(apiKey)
    if (user) {
      req.user = {
        iat: 0,
        exp: Infinity,
        expires: Infinity,
        userId: user.userId,
        alias: user.userId,
        email: user.email,
        isApiUser: true,
      }
      next()
      return
    }
  }

  const user = getToken(req)
  if (!user) {
    return next(new StatusError('Not authorized', 401))
  }

  req.user = user
  next()
}

export const adminMiddleware: RequestHandler = (req, _, next) => {
  const user = getToken(req)
  if (!user || user.userId !== 'carl') {
    return next(new StatusError('Not authorized', 401))
  }

  req.user = user
  next()
}

function getToken(req: Request) {
  const header = req.header('authorization')
  if (!header) {
    return null
  }

  if (!header.startsWith('Bearer ')) {
    return null
  }

  const token = header.replace('Bearer ', '')
  req.token = token
  try {
    const result: any = jwt.verify(token, config.jwtSecret)
    if (typeof result === 'string') {
      const user = JSON.parse(result)
      return user as AuthToken
    }

    return result as AuthToken
  } catch (err) {
    return null
  }
}
