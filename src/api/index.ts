import { Router } from 'express'

export { router as default }

const router = Router()

router.get('/health-check', (_, res) => res.send('OK'))
