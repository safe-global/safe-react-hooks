export class BaseError<T extends string> extends Error {
  override name: T
  override message: string
  cause?: any

  constructor(name: T, message: string, cause?: any) {
    super(message)
    this.name = name
    this.message = message
    this.cause = cause
  }
}
