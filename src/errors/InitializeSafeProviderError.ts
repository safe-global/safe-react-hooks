import { BaseError } from './BaseError.js'

export class InitializeSafeProviderError extends BaseError<string> {
  constructor(message = 'Failed to intialize SafeProvider.', cause?: any) {
    super('InitializeSafeProviderError', message, cause)
  }
}
