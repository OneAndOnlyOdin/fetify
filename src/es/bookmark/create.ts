export type BookmarkOptions<TPosition = unknown> = {
  get(): Promise<TPosition>
  save(bookmark: TPosition): Promise<void>
}

export class Bookmark<TPosition = unknown> {
  get: () => Promise<TPosition>
  save: (bookmark: TPosition) => Promise<void>

  constructor(opts: BookmarkOptions<TPosition>) {
    this.get = opts.get
    this.save = opts.save
  }
}
