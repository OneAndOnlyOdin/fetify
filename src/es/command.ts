import { Agg, NewEvent, ESEvent, Command, StateAgg } from './types'
import { Repo } from './repo'
import { StoreWriter } from './store'
import { VersionConflictError } from './store/error'
import { CommandError } from './errors'
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
                ...event
              },
              type: event.type
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

export function createStateHandler<
  TEvt extends ESEvent,
  TCmd extends Command,
  TAgg extends StateAgg<unknown>
>(
  stateDispatcher: StateDispatcher<TEvt, TCmd, TAgg>,
  repo: Repo<TEvt, TAgg>,
  writer: StoreWriter<TEvt>,
  stateError: new (_: string) => Error = CommandError
) {
  const dispatcher = {} as Dispatcher<TEvt, TCmd, TAgg>
  const keys = Object.keys(stateDispatcher) as Array<TCmd['type']>
  for (const key of keys) {
    const [handleFunc, ...states] = stateDispatcher[key]

    const wrappedFunc = (
      cmd: ExtractCmd<TCmd, typeof key>,
      agg: TAgg,
      logger: Logger
    ) => {
      if (!states.includes(agg.state)) {
        throw new stateError(
          `Unable execute command '${cmd.type}' for aggregate in state '${agg.state}'`
        )
      }
      return handleFunc(cmd, agg, logger)
    }
    dispatcher[key] = wrappedFunc
  }

  return createHandler(dispatcher, repo, writer)
}

type Dispatcher<
  TEvt extends ESEvent,
  TCmd extends Command,
  TAgg extends Agg
> = { [K in TCmd['type']]: HandleFunc<TEvt, ExtractCmd<TCmd, K>, TAgg> }

type StateDispatcher<
  TEvt extends ESEvent,
  TCmd extends Command,
  TAgg extends StateAgg<unknown>
> = {
  [K in TCmd['type']]: [
    HandleFunc<TEvt, ExtractCmd<TCmd, K>, TAgg>,
    ...TAgg['state'][]
  ]
}

type HandleFunc<
  TEvt extends ESEvent,
  TCmd extends Command,
  TAgg extends Agg
> = (cmd: TCmd, agg: TAgg, logger: Logger) => Promise<TEvt | TEvt[] | void>

type ExtractCmd<T extends Command, U extends T['type']> = T extends { type: U }
  ? T
  : never

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
