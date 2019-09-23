import { Router } from 'express'
import user from './user'

export { router as default }

const router = Router()

router.use('/user', user)
router.get('/health-check', (_, res) => res.send('OK'))
