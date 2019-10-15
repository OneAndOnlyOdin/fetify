import { createProvider } from 'evtstore/provider/mongo'
import { collections } from '../db/event'
import { Event } from 'evtstore'

export async function getProvider<T extends Event>() {
  const provider = createProvider<T>({
    events: collections.events,
    bookmarks: collections.bookmarks,
  })
  return provider
}

export type DomainEvent<T extends string, U extends {} = {}> = { type: T } & U
export type DomainCmd<T extends string, U extends {} = {}> = { type: T } & U
