import { wrap, StatusError } from '../util'
import { auth } from '../../db/auth'

type Body = {
  username: string
  password: string
}

export const login = wrap(async (req, res) => {
  const { username, password }: Body = req.body
  if (!username || !password) {
    throw new StatusError('Username or password not specified', 400)
  }

  const badLogin = new StatusError('Invalid username or password', 401)
  const user = await auth.getUser(username)
  if (!user) {
    throw badLogin
  }

  const isCorrect = await auth.compare(password, user.hash)
  if (!isCorrect) {
    throw badLogin
  }

  const token = await auth.createToken(username)
  res.json(token)
})
