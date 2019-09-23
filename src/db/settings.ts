import * as path from 'path'
import { config } from '../env'

const migrationsDir = path.resolve(__dirname, 'migrations')

export = {
  mongodb: {
    url: process.env.gameMigrationsMongoUri || 'mongodb://127.0.0.1:27017',
    databaseName: config.dbName,
    options: { useNewUrlParser: true }
  },
  changelogCollectionName: 'changelog',
  migrationsDir
}
