import { ESEvent, AppendEvents } from '../types'

export type WriterOptions<TEvent extends ESEvent> = {
  append: AppendEvents<TEvent>
}

export class StoreWriter<TEvent extends ESEvent> {
  append: AppendEvents<TEvent>

  constructor(opts: WriterOptions<TEvent>) {
    this.append = opts.append
  }
}
