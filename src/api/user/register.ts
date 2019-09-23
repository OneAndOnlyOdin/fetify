import { wrap, StatusError } from '../util'
import { userCmd } from '../../domain/user/command'
import { auth } from '../../db/auth'

type Body = {
  username: string
  password: string
  confirm: string
}

export const register = wrap(async (req, res) => {
  const { username, password, confirm }: Body = req.body

  if (!username || !password || !confirm) {
    throw new StatusError('Invalid request', 400)
  }

  if (password !== confirm) {
    throw new StatusError('Passwords do not match', 400)
  }

  try {
    await auth.createUser(username, password)
    await userCmd.CreateUser({ aggregateId: username })
  } catch (ex) {
    throw new StatusError(ex.message, 400)
  }

  const token = await auth.createToken(username)

  res.send(token)
})
