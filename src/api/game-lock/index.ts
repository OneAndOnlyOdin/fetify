import { Router } from 'express'
import { authMiddleware } from '../util'
import { getLocks } from './get'
import { createLock } from './create'
import { drawLockCard } from './draw-lock-card'

export { router as default }

const router = Router()

router.get('/', authMiddleware, getLocks)
router.post('/', authMiddleware, createLock)
router.post('/:id/draw', authMiddleware, drawLockCard)
