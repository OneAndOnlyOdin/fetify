import { Router } from 'express'
import { authMiddleware } from '../util'
import { getLocks } from './get'
import { createLock } from './create'
import { drawLockCard } from './draw-lock-card'
import { joinLock } from './join'

export { router as default }

const router = Router()

router.use(authMiddleware)
router.get('/', getLocks)
router.post('/', createLock)
router.post('/:id/draw', drawLockCard)
router.post('/:id/join', joinLock)
