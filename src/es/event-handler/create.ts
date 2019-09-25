import { ESEvent, StoredEvent } from '../types'
import { Bookmark } from '../bookmark'
import { StoreReader } from '../store'
import { createLogger, Logger } from '../../logger'

export type HandlerOptions<TEvent extends ESEvent, TPosition = unknown> = {
  name: string
  bookmark: Bookmark<TPosition>
  reader: StoreReader<TEvent, TPosition>
}

type HandleFunc<TEvent extends ESEvent> = (
  event: StoredEvent<TEvent>,
  logger: Logger
) => Promise<void>

const POLL_SLEEP_MSEC = 1000
const CRASH_SLEEP_MSEC = 10000

type Hook = 'pre-event' | 'post-event'

export class ESEventHandler<TEvent extends ESEvent, TPosition = unknown> {
  name: string
  /** E.g. The read model populator or command dispatcher */
  private eventTypes = new Set<string>()
  private handlers = new Map<string, HandleFunc<TEvent>>()
  private logger: Logger

  private hooks = new Map<Hook, (logger: Logger) => Promise<void>>()

  private bookmark: Bookmark<TPosition>
  private reader: StoreReader<TEvent, TPosition>

  private isRunning = false
  private position?: TPosition
  private lastMinute = new Date().getMinutes()
  private eventsHandled = 0

  constructor(options: HandlerOptions<TEvent, TPosition>) {
    this.name = `${options.name}`
    this.reader = options.reader
    this.bookmark = options.bookmark
    this.logger = createLogger(options.name)
    this.run()
  }

  private run = async () => {
    try {
      if (!this.isRunning) {
        setTimeout(this.run, POLL_SLEEP_MSEC)
        return
      }

      const handled = await this.runOnce()
      this.eventsHandled += handled

      const currentMin = new Date().getMinutes()
      if (currentMin !== this.lastMinute) {
        if (this.eventsHandled) {
          this.logger.info(
            { handler: this.name, processed: this.eventsHandled },
            'Events handled'
          )
        }
        this.lastMinute = currentMin
        this.eventsHandled = 0
      }

      if (handled > 0) {
        setTimeout(this.run)
        return
      }

      /**
       * If no events were received, wait before processing again
       */
      setTimeout(this.run, POLL_SLEEP_MSEC)
      return
    } catch (err) {
      this.logger.error(`Failed to process events`, { err })

      /**
       * On a failure, wait before trying to run again
       */
      setTimeout(this.run, CRASH_SLEEP_MSEC)
    }
  }

  /**
   * This is only public for the purposes of testing
   */
  runOnce = async (withHooks = true): Promise<number> => {
    if (!this.position) {
      this.position = await this.bookmark.get()
    }

    const eventTypes = Array.from(this.eventTypes.values())
    const events = await this.reader.getEventsFrom(this.position!, eventTypes)

    const preHook = this.hooks.get('pre-event')
    if (withHooks && preHook) {
      await preHook(this.logger)
    }

    for (const event of events) {
      const handler = this.handlers.get(event.type)
      if (handler) {
        await handler(event as any, this.logger)
      }
      this.position = event.position
      await this.bookmark.save(event.position)
    }

    const postHook = this.hooks.get('post-event')
    if (withHooks && postHook) {
      await postHook(this.logger)
    }

    return events.length
  }

  start = () => {
    this.isRunning = true
  }

  stop = () => {
    this.isRunning = false
  }

  reset = () => {
    this.position = undefined
  }

  hook = (hook: Hook, handler: () => Promise<void>) => {
    this.hooks.set(hook, handler)
  }

  handle = <TType extends TEvent['type']>(
    type: TType,
    handler: (
      event: StoredEvent<ExtractEvent<TEvent, TType>>,
      logger: Logger
    ) => Promise<void>
  ) => {
    this.eventTypes.add(type)
    this.handlers.set(type, handler as HandleFunc<TEvent>)
  }
}

type ExtractEvent<U extends ESEvent, T extends U['type']> = Extract<
  U,
  { type: T }
>
