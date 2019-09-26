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
