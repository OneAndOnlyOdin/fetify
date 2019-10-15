declare type AuthToken = BaseToken & {
  exp: number
  iat: number
}

declare type BaseToken = {
  expires: number
  userId: string
  email?: string
  alias?: string
}

declare type Msg<T extends string, P extends {}> = {
  type: T
  payload: P
}

declare type Maybe<T> = T | undefined
