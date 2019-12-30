import { collections } from '../db/event'
import { Event } from 'evtstore'
import { createProvider } from 'evtstore/provider/mongo'

export async function getProvider<T extends Event>() {
  const provider = createProvider<T>({
    bookmarks: collections.bookmarks,
    events: collections.events,
  })

  return provider
}

export type DomainEvent<T extends string, U = {}> = { type: T } & U

export type DomainCmd<T extends string, U = {}> = { type: T } & U
