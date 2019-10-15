import { Router } from 'express'
import { authMiddleware } from '../util'
import { createInvite } from './create'
import { listInvites } from './list'

export { router as default }

const router = Router()

router.use(authMiddleware)
router.post('/', createInvite)
router.get('/', listInvites)
