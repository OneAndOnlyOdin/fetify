import { Router } from 'express'
import { authMiddleware } from '../util'
import { getLocks } from './get'
import { createLock } from './create'

export { router as default }

const router = Router()

router.get('/', authMiddleware, getLocks)
router.post('/', authMiddleware, createLock)
