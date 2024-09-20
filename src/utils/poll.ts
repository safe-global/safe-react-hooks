/**
 * Poll a function until a condition is met.
 * @param fn Function to poll.
 * @param fnCondition Function to check if the polling should stop. As long as this function returns `true`, the polling will continue.
 * @param ms Optional number of milliseconds to wait between each poll. Default is 1000 ms.
 * @returns Result of the polling.
 */
export async function poll<Result>(
  fn: () => Promise<Result>,
  fnCondition: (result: Result) => boolean,
  ms = 1000
) {
  const result = await fn()

  if (fnCondition(result)) {
    await wait(ms)
    return poll(fn, fnCondition, ms)
  }

  return result
}

/**
 * Wait for a number of milliseconds.
 * @param ms Number of milliseconds to wait.
 * @returns Promise that resolves after `ms` milliseconds.
 */
export function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
