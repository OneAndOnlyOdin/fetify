import { Router } from 'express'
import { authMiddleware } from '../util'
import { register } from './register'
import { login } from './login'
import { update } from './update'
import { renew } from './renew'

export { router as default }

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/renew', authMiddleware, renew)
router.post('/', authMiddleware, update)
