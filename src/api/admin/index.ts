import { Router } from 'express'
import { clearLock } from './clear-lock'
import { adminMiddleware } from '../util'

export { router as default }

const router = Router()

router.use(adminMiddleware)
router.get('/', (_, res) => res.json('OK'))
router.post('/clear-lock', clearLock)
