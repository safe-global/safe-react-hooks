import { BaseError } from './BaseError.js'

export class AuthenticationError extends BaseError<string> {
  constructor(message: string, cause?: any) {
    super('AuthenticationError', message, cause)
  }
}
