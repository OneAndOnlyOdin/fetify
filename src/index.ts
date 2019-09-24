import { createServer } from './server'
import { userDomain } from './domain/user'
import { lockDomain } from './domain/game/lock'
import { initiate } from './db/message'

createServer(1)

userDomain.mgr.start()
lockDomain.mgr.start()
initiate()
