import { Router } from 'express'
import { register } from './register'
import { login } from './login'
import { update } from './update'
import { authMiddleware } from '../util'

export { router as default }

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/', authMiddleware, update)
