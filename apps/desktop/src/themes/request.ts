import { atom } from 'nanostores'

import { $activeGatewayProfile, normalizeProfileKey } from '@/store/profile'

import { $pendingSkinApply } from './backend-sync'
import type { ThemeMode } from './context'
import { setLocalFollowing } from './local-theme'
import { resolveTheme } from './user-themes'

/**
 * Ask for a theme switch from outside React. Returns whether the name resolved.
 *
 * An unknown name is refused rather than coerced. `setTheme` falls back to the
 * default skin for anything it can't resolve, which is right for a person
 * picking from a list but wrong for code reacting to an event: a gateway naming
 * a theme the user never installed would silently reset their appearance
 * instead of leaving it alone. The boolean doubles as the availability check,
 * so a caller needs no separate lookup to know it got what it asked for.
 */
export function requestTheme(name: string): boolean {
  if (!resolveTheme(name)) {
    return false
  }

  setLocalFollowing(normalizeProfileKey($activeGatewayProfile.get()), false)
  $pendingSkinApply.set(name)

  return true
}

/** One-shot manual mode request, cleared by ThemeProvider. */
export const $pendingModeApply = atom<null | ThemeMode>(null)

/** Ask for a mode switch from outside React; persisted per profile like a manual pick. */
export function requestMode(mode: ThemeMode): void {
  setLocalFollowing(normalizeProfileKey($activeGatewayProfile.get()), false)
  $pendingModeApply.set(mode)
}
