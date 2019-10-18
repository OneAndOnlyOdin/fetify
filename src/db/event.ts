import { connect } from 'mongodb'
import { config } from '../env'

export const database = connect(
  config.db.uri,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    autoReconnect: true,
    reconnectTries: Infinity,
    ignoreUndefined: true,
    w: 'majority',
    j: true,
  }
).then(client => client.db())

export const collections = {
  events: database.then(db => db.collection(config.db.events)),
  bookmarks: database.then(db => db.collection(config.db.bookmarks)),
}
