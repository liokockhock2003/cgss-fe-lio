export const delayPromise = (ms = 1000) =>
  new Promise<void>((res) => {
    setTimeout(() => {
      res()
    }, ms)
  })
