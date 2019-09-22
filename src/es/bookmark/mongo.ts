import { Timestamp } from 'bson'
import { bookmarks } from '../../db/event'
import { Bookmark } from './create'

export function createMongoBookmark(name: string) {
  const get = async (): Promise<Timestamp> => {
    const position = await bookmarks(coll => coll.findOne({ key: name }))
    if (!position) {
      return new Timestamp(0, 0)
    }

    return position.bookmark
  }

  const save = async (position: Timestamp) => {
    await bookmarks(coll =>
      coll.updateOne(
        { key: name },
        { $set: { bookmark: position } },
        { upsert: true }
      )
    )
  }

  return new Bookmark<Timestamp>({ get, save })
}
