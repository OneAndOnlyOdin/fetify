import { createServer } from './server'
import { userDomain } from './domain/user'
import { lockDomain } from './domain/game/lock'
import { initiate } from './db/message'
import { migrate } from './db/migrate'

async function start() {
  await migrate()
  userDomain.mgr.start()
  lockDomain.mgr.start()
  lockDomain.pop.start()
  createServer(1)
  initiate()
}

start()
