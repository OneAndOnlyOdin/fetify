import { Router } from 'express'
import user from './user'
import lock from './lock'
import admin from './admin'

export { router as default }

const router = Router()

router.use('/user', user)
router.use('/lock', lock)
router.use('/admin', admin)
router.get('/healthcheck', (_, res) =>
  res.json({
    status: 'OK',
    now: new Date().toISOString(),
  })
)
