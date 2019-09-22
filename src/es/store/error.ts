export class EventStoreError extends Error {}

export class VersionConflictError extends EventStoreError {}

export function isAggregateVersionConflict(ex: any): boolean {
  const aggregateVersionIndexName = 'es-aggregate-version'
  return (
    isUniqueConstraintViolation(ex) &&
    ex.message.includes(aggregateVersionIndexName)
  )
}

function isUniqueConstraintViolation(ex: any): boolean {
  const UniqueConstraintName = 'MongoError'
  const UniqueConstraintCode = 11000

  return ex.name === UniqueConstraintName && ex.code === UniqueConstraintCode
}
