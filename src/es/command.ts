import { Agg, NewEvent, ESEvent, Command } from './types'
import { Repo } from './repo'
import { StoreWriter } from './store'
import { VersionConflictError } from './store/error'
import { createLogger, Logger } from '../logger'

const MAX_COMMAND_RETRIES = 3

export function createHandler<
  TEvt extends ESEvent,
  TCmd extends Command,
  TAgg extends Agg
>(
  dispatcher: Dispatcher<TEvt, TCmd, TAgg>,
  repo: Repo<TEvt, TAgg>,
  writer: StoreWriter<TEvt>
) {
  type CmdHandler = {
    [K in TCmd['type']]: (
      cmd: Omit<ExtractCmd<TCmd, K>, 'type'>
    ) => Promise<void>
  }
  const handler: any = {}

  const logger = createLogger(`${repo.name}-command`)

  const keys = Object.keys(dispatcher) as Array<TCmd['type']>
  for (const key of keys) {
    const handleFunc: Function = dispatcher[key]

    const wrappedFunc = async (cmd: ExtractCmd<TCmd, typeof key>) => {
      let retry = 0
      while (true) {
        const aggregate: Agg = await repo.get(cmd.aggregateId)
        const raisedEvent = await handleFunc(cmd, aggregate, logger)
        if (!raisedEvent) {
          return
        }

        const events: TEvt[] = Array.isArray(raisedEvent)
          ? raisedEvent
          : [raisedEvent]

        try {
          for (const event of events) {
            const toPersist: NewEvent<TEvt> = {
              aggregateId: cmd.aggregateId,
              event: {
                aggregateId: cmd.aggregateId,
                type: event.type,
                ...event,
              },
              type: event.type,
            }

            await writer.append(aggregate.version, toPersist)
          }
        } catch (ex) {
          if (
            ex instanceof VersionConflictError &&
            retry++ < MAX_COMMAND_RETRIES
          ) {
            continue
          }
          throw ex
        }
        return
      }
    }
    handler[key] = wrappedFunc
  }

  return handler as CmdHandler
}

type Dispatcher<
  TEvt extends ESEvent,
  TCmd extends Command,
  TAgg extends Agg
> = { [K in TCmd['type']]: HandleFunc<TEvt, ExtractCmd<TCmd, K>, TAgg> }

type HandleFunc<
  TEvt extends ESEvent,
  TCmd extends Command,
  TAgg extends Agg
> = (cmd: TCmd, agg: TAgg, logger: Logger) => Promise<TEvt | TEvt[] | void>

type ExtractCmd<T extends Command, U extends T['type']> = T extends { type: U }
  ? T
  : never

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
