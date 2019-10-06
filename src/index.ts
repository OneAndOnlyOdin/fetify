import { createServer } from './server'
import { userDomain } from './domain/user'
import { lockDomain } from './domain/lock'
import { initiate } from './db/message'
import { migrate } from './db/migrate'
import { inviteDomain } from './domain/invite'

async function start() {
  await migrate()
  userDomain.mgr.start()
  lockDomain.mgr.start()
  lockDomain.pop.start()
  inviteDomain.pop.start()
  createServer(1)
  initiate()
}

start()

if (process.env.WEBPACK === 'true') {
  const webpack = require('webpack')
  const config = require('../../webpack.config')
  const compiler = webpack(config)
  const WebpackDevServer = require('webpack-dev-server')
  const server = new WebpackDevServer(compiler, {
    open: true,
    port: 3010,
    hot: true,
    historyApiFallback: true,
  })
  server.listen(3010, '0.0.0.0', () => {})
}
