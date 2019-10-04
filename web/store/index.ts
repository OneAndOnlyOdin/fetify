import './auth'
import './time'
import './lock'
import * as authApi from './auth'
import * as timeApi from './time'
import * as locksApi from './lock'
import * as toastApi from './toast'
import { webSockets } from './socket'

export { authApi, locksApi, timeApi, toastApi, webSockets }
