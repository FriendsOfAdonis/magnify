export function sleep(seconds = 1) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, seconds * 1000)
  })
}
