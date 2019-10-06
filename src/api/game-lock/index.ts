import { Router } from 'express'
import { authMiddleware } from '../util'
import { getLocks } from './get'
import { createLock } from './create'
import { drawLockCard } from './draw-lock-card'
import { joinLock } from './join'
import { renameLock } from './rename'
import { removeLock } from './remove'
import { addCards } from './add-cards'

export { router as default }

const router = Router()

router.use(authMiddleware)
router.get('/', getLocks)
router.post('/', createLock)
router.post('/:id/rename', renameLock)
router.post('/:id/delete', removeLock)
router.post('/:id/draw', drawLockCard)
router.post('/:id/join', joinLock)
router.post('/:id/add', addCards)
