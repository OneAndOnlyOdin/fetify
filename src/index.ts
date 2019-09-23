import { createServer } from './server'
import { userDomain } from './domain/user'

createServer(1)

userDomain.mgr.start()
