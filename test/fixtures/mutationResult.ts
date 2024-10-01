import {
  MutationObserverErrorResult,
  MutationObserverIdleResult,
  MutationObserverLoadingResult,
  MutationObserverSuccessResult
} from '@tanstack/react-query'

export const mutationIdleResult: MutationObserverIdleResult = {
  mutate: expect.any(Function),
  isIdle: true,
  isPaused: false,
  isPending: false,
  isSuccess: false,
  reset: expect.any(Function),
  status: 'idle',
  submittedAt: 0,
  variables: undefined,
  context: undefined,
  data: undefined,
  error: null,
  failureCount: 0,
  failureReason: null,
  isError: false
}

export const mutationPendingResult: MutationObserverLoadingResult = {
  ...mutationIdleResult,
  isIdle: false,
  isPending: true,
  status: 'pending'
}

export const mutationSuccessResult: MutationObserverSuccessResult = {
  ...mutationIdleResult,
  isIdle: false,
  isSuccess: true,
  status: 'success',
  submittedAt: expect.any(Number)
}

export const mutationErrorResult: MutationObserverErrorResult = {
  ...mutationIdleResult,
  isIdle: false,
  isError: true,
  status: 'error',
  failureCount: 1,
  submittedAt: expect.any(Number),
  variables: expect.any(Object),
  error: new Error('Something went wrong :('),
  failureReason: new Error('Something went wrong :(')
}

const resultMapping = {
  idle: mutationIdleResult,
  pending: mutationPendingResult,
  success: mutationSuccessResult,
  error: mutationErrorResult
}

export function getCustomMutationResult<
  TStatus extends keyof typeof resultMapping,
  TMutateFnName extends string,
  TResult = (typeof resultMapping)[TStatus],
  TData = TStatus extends 'success' ? unknown : undefined,
  TError = TStatus extends 'error' ? Error : undefined,
  TVariables = TStatus extends 'error' | 'success' ? unknown : undefined
>({
  status,
  mutateFnName,
  data,
  error,
  variables
}: {
  status: TStatus
  mutateFnName: TMutateFnName
  data?: TData
  error?: TError
  variables?: TVariables
}) {
  const { mutate, ...result } = resultMapping[status]
  return {
    ...result,
    [mutateFnName]: mutate,
    [`${mutateFnName}Async`]: mutate,
    ...(status === 'success' && data ? { data, variables } : {}),
    ...(status === 'error' && error ? { error, failureReason: error, variables } : {})
  } as Omit<TResult, 'mutate'> & {
    [k in TMutateFnName]: typeof mutate
  } & {
    [key in `${TMutateFnName}Async`]: typeof mutate
  } & (TStatus extends 'error'
      ? {
          error: TError
          failureReason: TError
        }
      : {}) &
    (TStatus extends 'success'
      ? {
          data: TData
        }
      : {})
}
