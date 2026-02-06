import { EventEmitter } from 'events'
import { uIOhook } from 'uiohook-napi'

const IDLE_TIMEOUT = 3000 // 3 seconds

class MouseWatcher extends EventEmitter {
  private idleTimer: NodeJS.Timeout | null = null
  private isRunning: boolean = false

  constructor() {
    super()
  }

  /**
   * Handle mouse move event from uiohook
   */
  private onMouseMove(event: { x: number; y: number }): void {
    this.emit('mousemove', { x: event.x, y: event.y })
    this.resetIdleTimer()
  }

  /**
   * Reset idle timer - clear existing and set new 3s timeout
   */
  private resetIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer)
    }

    this.idleTimer = setTimeout(() => {
      this.emit('idle')
    }, IDLE_TIMEOUT)
  }

  /**
   * Start monitoring mouse movement using uiohook
   */
  start(): void {
    if (this.isRunning) return

    this.isRunning = true

    // Listen to mouse move events
    uIOhook.on('mousemove', this.onMouseMove.bind(this))

    // Start uiohook
    uIOhook.start()

    // Initialize idle timer
    this.resetIdleTimer()
  }

  /**
   * Stop monitoring mouse movement
   */
  stop(): void {
    if (!this.isRunning) return

    this.isRunning = false

    if (this.idleTimer) {
      clearTimeout(this.idleTimer)
      this.idleTimer = null
    }

    uIOhook.stop()
    uIOhook.removeAllListeners('mousemove')
  }
}

// Singleton instance
const mouseWatcher = new MouseWatcher()

export function startMouseWatcher(): void {
  mouseWatcher.start()
}

export function stopMouseWatcher(): void {
  mouseWatcher.stop()
}

export { mouseWatcher }
