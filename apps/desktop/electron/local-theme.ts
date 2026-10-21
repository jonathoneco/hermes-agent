import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { type LocalThemeState, parseLocalTheme } from '../shared/local-theme'

export function openLocalThemeSource(
  file = path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'), 'hermes-desktop/local-theme.json')
) {
  let current: LocalThemeState = { kind: 'absent' }
  let serialized = ''
  let watcher: fs.FSWatcher | undefined
  let watchedDirectory = ''
  let watchedInode: number | undefined
  let disposed = false
  const listeners = new Set<(state: LocalThemeState) => void>()

  const refresh = () => {
    if (disposed) {
      return
    }

    let next: LocalThemeState

    try {
      const stat = fs.statSync(file)

      if (!stat.isFile()) {
        throw new Error('Local theme must be a regular file')
      }

      if (stat.size > 64_000) {
        throw new Error('Local theme exceeds 64 KB')
      }

      next = { kind: 'ready', document: parseLocalTheme(JSON.parse(fs.readFileSync(file, 'utf8'))) }
    } catch (error) {
      next =
        error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT'
          ? { kind: 'absent' }
          : { kind: 'invalid', message: error instanceof Error ? error.message : String(error) }
    }

    const data = JSON.stringify(next)

    if (data !== serialized) {
      current = next
      serialized = data

      for (const listener of listeners) {
        listener(current)
      }
    }

    try {
      let directory = path.dirname(file)

      while (!fs.existsSync(directory)) {
        const parent = path.dirname(directory)

        if (parent === directory) {
          break
        }

        directory = parent
      }

      const inode = fs.statSync(directory).ino

      if (!watcher || watchedDirectory !== directory || watchedInode !== inode) {
        watcher?.close()
        watchedDirectory = directory
        watchedInode = inode

        try {
          watcher = fs.watch(directory, () => refresh())
          watcher.on('error', () => {
            watcher?.close()
            watcher = undefined
          })
        } catch (error) {
          console.warn('Local theme watch failed', directory, error)
        }
      }
    } catch (error) {
      console.warn('Local theme directory unavailable', path.dirname(file), error)
    }
  }

  refresh()
  const retry = setInterval(refresh, 2_000)
  retry.unref()

  return {
    get current() {
      return current
    },
    refresh,
    subscribe(listener: (state: LocalThemeState) => void) {
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    },
    dispose() {
      disposed = true
      clearInterval(retry)
      watcher?.close()
      listeners.clear()
    }
  }
}
