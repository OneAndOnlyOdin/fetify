import * as path from 'path'

const migrationsDir = path.resolve(__dirname, 'migrations')

export = {
  mongodb: {
    url: process.env.DB_URI || 'mongodb://127.0.0.1:27017',
    databaseName: process.env.DB_NAME || 'fetify',
    options: { useNewUrlParser: true },
  },
  changelogCollectionName: 'changelog',
  migrationsDir,
}
