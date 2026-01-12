export class Mutex {
  private locked = false
  private queue: Array<(release: () => void) => void> = []

  async acquire(): Promise<() => void> {
    if (!this.locked) {
      this.locked = true
      return this.makeRelease()
    }

    return new Promise<() => void>((resolve) => {
      this.queue.push((release) => resolve(release))
    })
  }

  private makeRelease(): () => void {
    let released = false
    return () => {
      if (released) {
        throw new Error('Mutex release() called more than once')
      }
      released = true
      this.release()
    }
  }

  private release(): void {
    const next = this.queue.shift()
    if (next) {
      next(this.makeRelease())
    } else {
      this.locked = false
    }
  }

  async withLock<T>(fn: () => Promise<T>): Promise<T> {
    const release = await this.acquire()
    try {
      return await fn()
    } finally {
      release()
    }
  }
}
