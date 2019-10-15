import { wrap, StatusError } from '../util'
import { userDomain } from '../../domain/user'
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

  const lowered = username.toLowerCase()

  try {
    await auth.createUser(lowered, password)
    await userDomain.cmd.CreateUser(lowered, {})
  } catch (ex) {
    throw new StatusError(ex.message, 400)
  }

  const token = await auth.createToken(lowered)

  res.json(token)
})
