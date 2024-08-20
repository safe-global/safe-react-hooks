import { BaseError } from './BaseError.js'

export class MissingSafeProviderError extends BaseError<string> {
  constructor(message = 'No wrapping `SafeProvider` component found.', cause?: any) {
    super('MissingSafeProviderError', message, cause)
  }
}
