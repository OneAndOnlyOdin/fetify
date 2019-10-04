export class CommandError extends Error {
  constructor(public msg: string, public code?: string) {
    super(msg)
  }
}
