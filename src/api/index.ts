import { Router } from 'express'
import user from './user'
import lock from './game-lock'

export { router as default }

const router = Router()

router.use('/user', user)
router.use('/lock', lock)
router.get('/health-check', (_, res) => res.send('OK'))
